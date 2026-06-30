import { describe, it, expect } from "vitest";
import { getSnippet } from "../snippet";
import type { RepoBundle } from "../types";

const bundle = {
  repoId: "x",
  owner: "o",
  repo: "r",
  branch: "main",
  fileTree: ["a.ts"],
  files: [{ path: "a.ts", content: "line1\nline2\nline3\nline4" }],
  stats: { filesLoaded: 1, filesTotal: 1, totalChars: 0, truncated: false },
} as RepoBundle;

describe("getSnippet", () => {
  it("slices an inclusive line range", () => {
    const s = getSnippet(bundle, { path: "a.ts", startLine: 2, endLine: 3 });
    expect(s).toEqual({
      lines: [
        { n: 2, text: "line2" },
        { n: 3, text: "line3" },
      ],
    });
  });
  it("returns null for an unknown path", () => {
    expect(getSnippet(bundle, { path: "missing.ts", startLine: 1, endLine: 1 })).toBeNull();
  });
  it("clamps out-of-range lines", () => {
    const s = getSnippet(bundle, { path: "a.ts", startLine: 3, endLine: 99 });
    expect(s?.lines.map((l) => l.n)).toEqual([3, 4]);
  });
});
