import type { RepoBundle, Citation } from "./types";

export function getSnippet(
  bundle: RepoBundle,
  c: Citation,
): { lines: { n: number; text: string }[] } | null {
  const file = bundle.files.find((f) => f.path === c.path);
  if (!file) return null;
  const all = file.content.split("\n");
  const start = Math.max(1, c.startLine);
  const end = Math.min(all.length, c.endLine);
  const lines: { n: number; text: string }[] = [];
  for (let n = start; n <= end; n++) lines.push({ n, text: all[n - 1] });
  return { lines };
}
