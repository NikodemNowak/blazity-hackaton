# Product

**RepoLens** — a Blazity "AI for Content" hackathon web app. The "content" is a
codebase and its docs. Full concept and build plan: `docs/CONCEPT.md`.

## The pain

Understanding an unfamiliar codebase takes hours, and READMEs/docs drift out of
sync with the code they describe — so they mislead the reader.

## What it does

Paste a **GitHub repo URL**; RepoLens ingests the repo (file tree + contents) and
offers three features over the same in-memory bundle:

- **Chat with the repo** — ask questions, get answers with `file:line` citations.
- **Generate docs** — onboarding/architecture overview written from the actual code.
- **Drift check** — compares README/docs against the code, flags stale claims and
  cites the contradicting code.

## Why AI earns its place

"What does this project do" and "do the docs match the code" need understanding,
not rules. **"Checked, not trusted" is the core principle:** every answer and every
flag points at a concrete `file:line` whose snippet is rendered next to it, so a
human verifies the evidence rather than trusting the model blindly.

## Demo / success criteria

Load a real repo live and run all three end-to-end: ask a question (cited answer),
generate docs, run drift. Focus over scope — these three features are the whole
product. Judging favors clear reasoning about the problem and visible output checks.

## Explicitly NOT building (YAGNI)

Vector DB / embeddings, user accounts, persistence across restarts, multi-repo
history, writing generated docs back to GitHub, syntax-perfect diffing.
