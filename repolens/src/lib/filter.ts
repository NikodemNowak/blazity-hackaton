import type { RepoFile } from "./types";

const SKIP_DIRS = ["node_modules/", ".git/", "dist/", "build/", ".next/", "vendor/"];
const SKIP_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "poetry.lock",
  "go.sum",
  "cargo.lock",
];
const BINARY_EXT = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".pdf",
  ".zip",
  ".gz",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
  ".lock",
  ".min.js",
];

export function shouldIncludePath(path: string): boolean {
  const lower = path.toLowerCase();
  if (SKIP_DIRS.some((d) => lower.includes(d))) return false;
  if (SKIP_FILES.includes(lower.split("/").pop() ?? "")) return false;
  if (BINARY_EXT.some((e) => lower.endsWith(e))) return false;
  return true;
}

export function applyBudget(
  files: RepoFile[],
  maxFiles = 300,
  maxChars = 600_000,
): { kept: RepoFile[]; truncated: boolean } {
  const kept: RepoFile[] = [];
  let chars = 0;
  for (const f of files) {
    if (kept.length >= maxFiles || chars + f.content.length > maxChars) {
      return { kept, truncated: true };
    }
    kept.push(f);
    chars += f.content.length;
  }
  return { kept, truncated: false };
}
