import type { RepoBundle } from "./types";

const store = new Map<string, RepoBundle>();

export function saveBundle(b: RepoBundle): void {
  store.set(b.repoId, b);
}

export function getBundle(repoId: string): RepoBundle | undefined {
  return store.get(repoId);
}
