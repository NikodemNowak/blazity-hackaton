# RepoLens — concept & build plan

> Hackathon: **AI for Content** · Next.js + TypeScript · Claude (Anthropic) API
> Team of 3 · ~3h build budget · status: **brainstorm, pre-scaffold**

## The pain

A developer (new hire, reviewer, or anyone evaluating a project) has to understand
an unfamiliar codebase. Today that means hours or days of reading. READMEs lie,
because code moved on and the docs didn't.

## The product

Paste a **GitHub repo URL** → RepoLens ingests the repo (file tree + file contents)
and gives three things in one UI:

| Feature | What it does | Owner |
|---|---|---|
| **A · Chat with the repo** | Ask "how does auth work?" → answer **with `file:line` citations**; the UI renders the real code snippet as evidence. | dev 1 |
| **B · Generate docs** | Onboarding / architecture overview generated from the actual code. | dev 2 |
| **C · Drift check** | Compares README/docs against the code, flags stale claims, **citing the contradicting code**. | dev 3 |

### Why the AI earns its place
Judging "what does this project do" and "do the docs match the code" can't be
hard-coded with rules — it needs understanding. And **"checked, not trusted" is
built in**: every answer and every flag points at a concrete `file:line` whose
snippet we render next to it. The human verifies the evidence, never trusts blindly.

## Architecture

Key shortcut: **Opus 4.8 has a 1M-token context window.** For small/medium repos we
do **not** need a vector DB or RAG (a time sink for 3h). We pack the repo into context.

```
GitHub URL ──▶ /api/ingest ──▶ fetch tree + files (GitHub API)
                                 filter + budget ──▶ in-memory bundle (repoId)
                                                          │
                 ┌────────────────────────────────────────┼───────────────────────┐
                 ▼                                          ▼                       ▼
          /api/chat                              /api/generate-docs           /api/drift
        (dev 1 · feature A)                      (dev 2 · feature B)        (dev 3 · feature C)
                 │                                          │                       │
                 └──────────── all call getBundle(repoId) + askClaude() ───────────┘
```

### Core (built first, in Build Session I)
1. **`POST /api/ingest`** `{ repoUrl }` → fetches the recursive tree + file contents
   via the GitHub API, filters (skip `node_modules`, lockfiles, binaries, by
   extension), enforces a token budget, stores the bundle in a **server-side
   in-memory `Map`** keyed by `repoId`. Returns `{ repoId, fileTree, stats }`.
   No database.
2. **`getBundle(repoId)`** — shared server helper returning
   `{ tree, files: [{ path, content }], totalTokens }`.
3. **`askClaude({ system, messages, model })`** — thin wrapper over
   `@anthropic-ai/sdk`. Key stays in env, server-side only.

### The contract (this is what lets 3 people work in parallel)
Each feature = **its own API route file + its own UI tab component**, all consuming
`getBundle(repoId)`. Minimal merge conflicts.

- **A · `POST /api/chat`** `{ repoId, question, history }` → `{ answer, citations: [{ path, startLine, endLine }] }`
- **B · `POST /api/generate-docs`** `{ repoId, docType }` → `{ markdown }`
- **C · `POST /api/drift`** `{ repoId }` → `{ findings: [{ docFile, claim, contradictingCode: { path, startLine, endLine }, severity }] }`

A shared **`<CitationView>`** component pulls the snippet from the loaded bundle and
renders it — used by both chat and drift. This is the "checked not trusted" hook.

## UI surfaces (for the UI/styling work)

Single page, no routing needed beyond tabs. State: `repoId` in React state.

1. **Repo loader (top, persistent):** URL input + "Load repo" button; after load shows
   repo name, file count, token usage, and a collapsible file tree.
2. **Tabs:** `Chat` · `Docs` · `Drift`.
   - **Chat tab:** message thread; each assistant message can include one or more
     **citation cards** (`<CitationView>`: file path + line range + code snippet).
   - **Docs tab:** "Generate" button + doc-type selector → rendered markdown panel
     with copy/download.
   - **Drift tab:** "Run check" → list of findings; each finding shows the doc claim
     vs the contradicting code snippet, a severity badge, and accept/dismiss.
3. **Empty + loading states:** ingestion can take a few seconds — show progress
   ("loaded N of M files").

Visual direction is open — clean developer-tool aesthetic. (UI styling owner decides.)

## GitHub access (private repos)

Yes — private repos work, scoped to a single repo for safety. The token is
**server-side only** (`GITHUB_TOKEN` in `.env.local`, never `NEXT_PUBLIC_*`), used
only inside route handlers. The browser calls our API; our API calls GitHub.

**Decision: Fine-grained Personal Access Token (PAT)** — pinned to one repo,
**Contents: Read-only**. ~2 min to create, gives 5,000 req/hr, and is the obviously
right choice for a 3h demo against our own private repo.

- _GitHub App (per-repo install)_ — most secure (short-lived install tokens) but
  ~30–45 min of app registration + JWT signing. Overkill for the hackathon.
- _OAuth web flow_ — only if the demo needs arbitrary users to bring their own repos
  live on stage ("log in with GitHub"). Skip otherwise. **Fallback, not primary.**

### Fetching repo content
- **Primary: tree + blobs** (gives structured file list for the UI tree):
  `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` (1 request) → filter to
  text blobs under a size cap → `GET /repos/{owner}/{repo}/git/blobs/{sha}` per file
  (base64-decode). Throttle blob fetches to ~5–10 parallel to avoid the secondary
  abuse limit.
- **Alternative: tarball** `GET /repos/{owner}/{repo}/tarball/{ref}` — **one request**
  for the whole repo, untar in-memory. Fewer requests; use if rate limits bite. (We
  lose the structured tree, so prefer tree+blobs unless we hit limits.)
- Avoid `/contents/{path}` per file (N+1, 1MB/file cap, truncates large dirs).

Headers:
```
Authorization: Bearer ${GITHUB_TOKEN}
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
```

Rate limits: unauth 60/hr (unusable) → **PAT 5,000/hr**. Each response carries
`X-RateLimit-Remaining`.

### Ingest sketch (server-side only)
```ts
// app/api/ingest/route.ts
const H = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN!}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const base = `https://api.github.com/repos/${owner}/${repo}`;
const tree = await fetch(`${base}/git/trees/${branch}?recursive=1`, { headers: H }).then(r => r.json());
const files = tree.tree.filter((n: any) => n.type === "blob" && n.size < 100_000);
const contents = await Promise.all(
  files.slice(0, 300).map(async (f: any) => {
    const b = await fetch(`${base}/git/blobs/${f.sha}`, { headers: H }).then(r => r.json());
    return { path: f.path, text: Buffer.from(b.content, "base64").toString("utf8") };
  })
); // → store as the bundle, feed to Claude
```

## Work split (3 devs)

- **Build Session I (11:00–12:00) — CORE together (or 1–2 devs), others scaffold:**
  - Dev who owns core: `/api/ingest`, GitHub fetch, filtering/budget, `getBundle`,
    `askClaude` wrapper.
  - Meanwhile: Next.js scaffold (`create-next-app`), shared layout + tabs shell,
    `<CitationView>` skeleton, env wiring (Anthropic key + GitHub token).
- **Build Session II (12:30–13:15) — features in parallel:**
  - Dev 1 → Chat (A) · Dev 2 → Docs (B) · Dev 3 → Drift (C).
- **Demo:** load a real repo live, ask a question, generate docs, run drift. End-to-end.

## Models
- **Chat:** Sonnet 4.6 (fast, interactive).
- **Drift / Docs:** Opus 4.8 (harder reasoning over the whole repo).
- Optional stretch: a Haiku 4.5 "relevance pre-pass" that picks which files matter for
  a question, to keep context lean on big repos.

## Risks & mitigations
- **Repo too big for context** → filter aggressively (extensions, size cap ~200–500KB),
  show "loaded N of M". Stretch: relevance pre-pass.
- **GitHub rate limits** → use an authenticated token (see auth section).
- **Streaming** → start non-streaming for simplicity; add streaming to chat if time.
- **Scope creep** → core + the three routes is the whole project. No DB, no accounts.

## YAGNI (explicitly NOT building)
Vector DB / embeddings, user accounts, persistence across restarts, multi-repo
history, write-back of generated docs to GitHub, syntax-perfect diffing.
