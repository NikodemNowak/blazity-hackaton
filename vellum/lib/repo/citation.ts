import type { Citation } from "./types";

// Matches the inline markers the model emits: {{cite:path|start|end}}
const RE = /\{\{cite:([^|}]+)\|(\d+)\|(\d+)\}\}/g;
// A marker that is still being streamed (incomplete trailing token).
const PARTIAL = /\{\{cite[^}]*$/;

/**
 * Strip citation markers from the answer text and collect the unique citations.
 * Also removes a trailing partial marker so half-streamed markers don't flash.
 */
export function parseCitations(text: string): { clean: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const seen = new Set<string>();
  let clean = text.replace(RE, (_m, path: string, s: string, e: string) => {
    const c: Citation = { path: path.trim(), startLine: Number(s), endLine: Number(e) };
    const key = `${c.path}:${c.startLine}-${c.endLine}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push(c);
    }
    return "";
  });
  clean = clean.replace(PARTIAL, "");
  return { clean, citations };
}
