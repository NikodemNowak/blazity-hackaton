# Project Vocabulary

Use this file to define canonical product and codebase terms for AI agents.

## Terms

| Term | Meaning | Avoid |
| --- | --- | --- |
| RepoLens | The product: a web app that ingests a GitHub repo and offers chat, doc generation, and drift check over it. | "the tool" |
| Bundle | The in-memory ingested repo (`{ tree, files, totalTokens }`) keyed by `repoId`, read via `getBundle(repoId)`. Fed to Claude. | "the repo data", "cache" |
| repoId | Server-side key identifying one ingested bundle in the in-memory `Map`. | "session id" |
| Citation | A `file:line` reference (`{ path, startLine, endLine }`) attached to an answer or finding; rendered as a real code snippet by `<CitationView>`. | "source", "reference" |
| Drift | Mismatch between docs/README claims and the actual code; the drift check flags these with citing code. | "stale docs" (use for the check itself) |
| Ingest | The `/api/ingest` step that fetches, filters, and budgets the repo into a bundle. | "import", "load" (loosely) |
| Content | In RepoLens, the codebase and its docs are the content. Broadly: anything people produce/manage. | "data" (too generic) |
| Atlas | The AI workspace tooling (`@blazity-atlas/core`) that manages `.ai/`. Not part of the shipped product. | "the framework" |
| Claude | The Anthropic AI provider powering the app's features, via `@anthropic-ai/sdk`. | "the LLM", "GPT" |
