import { describe, it, expect } from "vitest";
import { shouldIncludePath, applyBudget } from "../filter";
import type { RepoFile } from "../types";

describe("shouldIncludePath", () => {
  it("keeps source and doc files", () => {
    expect(shouldIncludePath("src/app/page.tsx")).toBe(true);
    expect(shouldIncludePath("README.md")).toBe(true);
    expect(shouldIncludePath("lib/util.py")).toBe(true);
  });
  it("drops deps, locks, and binaries", () => {
    expect(shouldIncludePath("node_modules/x/index.js")).toBe(false);
    expect(shouldIncludePath("package-lock.json")).toBe(false);
    expect(shouldIncludePath("assets/logo.png")).toBe(false);
    expect(shouldIncludePath(".git/config")).toBe(false);
  });
});

describe("applyBudget", () => {
  const f = (path: string, n: number): RepoFile => ({ path, content: "x".repeat(n) });
  it("keeps everything under budget", () => {
    const r = applyBudget([f("a", 10), f("b", 10)], 300, 600_000);
    expect(r.kept.length).toBe(2);
    expect(r.truncated).toBe(false);
  });
  it("truncates when over the char cap", () => {
    const r = applyBudget([f("a", 100), f("b", 100)], 300, 150);
    expect(r.kept.length).toBe(1);
    expect(r.truncated).toBe(true);
  });
  it("truncates when over the file cap", () => {
    const r = applyBudget([f("a", 1), f("b", 1), f("c", 1)], 2, 600_000);
    expect(r.kept.length).toBe(2);
    expect(r.truncated).toBe(true);
  });
});
