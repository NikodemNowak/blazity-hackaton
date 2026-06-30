# Stack

Decided at setup; the application is **not yet scaffolded** (no `package.json`,
lockfile, or framework config in the repo yet).

## Decided

- **Language:** TypeScript.
- **Framework:** Next.js (React, full-stack web app — UI + API routes in one app).
- **AI provider:** Claude (Anthropic) via `@anthropic-ai/sdk`, server-side only.
  Model choice by task: **Sonnet 4.6** for interactive chat, **Opus 4.8** for the
  heavier drift/docs reasoning (its 1M context fits whole small/medium repos), and a
  possible **Haiku 4.5** relevance pre-pass as a stretch.
- **External API:** GitHub REST API for repo ingestion (git trees + blobs).
- **Secrets (env, never `NEXT_PUBLIC_*`, never committed):** `ANTHROPIC_API_KEY` and
  `GITHUB_TOKEN` (a fine-grained PAT, Contents: Read-only, scoped to the demo repo).
- **State:** server-side in-memory `Map` keyed by `repoId`. No database, no persistence.
- **Version control:** Git.
- **AI workspace:** Atlas (`@blazity-atlas/core`); run `npx --yes @blazity-atlas/core@latest doctor`.

## To confirm once scaffolded

- Exact run/test/build commands (expected to be the standard `next dev` / `next build`
  / `next start` plus a lint and test runner, but confirm against `package.json`).
- Package manager (npm / pnpm / yarn / bun) — decided by the lockfile that lands.
- Test framework and any CI.

## Unknowns

- Hosting/deploy target (e.g. Vercel) — not yet chosen.
- Markdown renderer and any UI component library.
