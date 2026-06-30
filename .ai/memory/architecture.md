# Architecture

RepoLens is a single Next.js app (UI + server-side API routes). No application code
has landed yet — this records the **planned, agreed design** (`docs/CONCEPT.md`), not
built code. The defining constraint: **all Claude and GitHub access is server-side**
so neither the Anthropic key nor the GitHub token reaches the client.

## Data flow

```
GitHub URL → /api/ingest → fetch tree + files (GitHub API), filter + token-budget
           → in-memory bundle keyed by repoId
           → /api/chat | /api/generate-docs | /api/drift  (all read getBundle(repoId))
```

## Core building blocks (built first)

- **`POST /api/ingest`** `{ repoUrl }` → fetches the recursive git tree + blob
  contents via the GitHub API, filters out noise (node_modules, lockfiles, binaries,
  oversized files), enforces a token budget, stores the result in a **server-side
  in-memory `Map`** keyed by `repoId`. Returns `{ repoId, fileTree, stats }`. No DB.
- **`getBundle(repoId)`** — shared server helper returning
  `{ tree, files: [{ path, content }], totalTokens }`.
- **`askClaude({ system, messages, model })`** — thin server-side wrapper over
  `@anthropic-ai/sdk`.

## Feature contract (lets work proceed in parallel)

Each feature is its own API route + its own UI tab, all consuming `getBundle(repoId)`:

- **`POST /api/chat`** `{ repoId, question, history }` → `{ answer, citations: [{ path, startLine, endLine }] }`
- **`POST /api/generate-docs`** `{ repoId, docType }` → `{ markdown }`
- **`POST /api/drift`** `{ repoId }` → `{ findings: [{ docFile, claim, contradictingCode: { path, startLine, endLine }, severity }] }`

A shared **`<CitationView>`** component renders a `file:line` snippet pulled from the
loaded bundle — used by both chat and drift; it is the "checked, not trusted" hook.

## Key decisions & rationale

- **No vector DB / RAG.** Opus 4.8's 1M-token context fits small/medium repos packed
  directly into context; RAG is a time sink for the build budget.
- **In-memory store, no persistence.** Bundle lives in a process `Map`; lost on
  restart, which is acceptable for the demo.
- **GitHub fetch via tree + blobs** (structured file list for the UI tree), throttled
  ~5–10 parallel; tarball is a fallback if rate limits bite. Avoid `/contents/{path}`
  (N+1, 1MB cap).

## UI shape

Single page, tabs only (no routing). `repoId` held in React state. Persistent repo
loader (URL input → repo name, file count, token usage, collapsible tree) above
`Chat` · `Docs` · `Drift` tabs. Ingestion takes seconds — show "loaded N of M files".

## Unknowns (confirm as code lands)

- App Router vs Pages Router; exact client/server component boundaries.
- Streaming for chat (planned to start non-streaming, add if time allows).
- Relevance pre-pass (Haiku 4.5) for large repos — stretch, may not ship.
