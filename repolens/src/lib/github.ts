import { shouldIncludePath } from "./filter";
import type { RepoFile } from "./types";

const H = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

// GitHub owners and repo names: alphanumerics plus -, _, . — no slashes,
// and never "." / ".." (which would let a crafted URL escape the
// /repos/{owner}/{repo} path via URL normalization → SSRF-style traversal).
const SEGMENT = /^[A-Za-z0-9._-]+$/;
function safeSegment(s: string): boolean {
  return SEGMENT.test(s) && s !== "." && s !== "..";
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const m = url
    .trim()
    .replace(/\.git$/, "")
    .match(/github\.com[/:]([^/]+)\/([^/]+)/);
  if (!m) throw new Error("Not a GitHub repo URL");
  const owner = m[1];
  const repo = m[2];
  if (!safeSegment(owner) || !safeSegment(repo)) {
    throw new Error("Invalid repo owner/name");
  }
  return { owner, repo };
}

async function getDefaultBranch(owner: string, repo: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: H });
  if (!res.ok) throw new Error(`GitHub repo lookup failed (${res.status})`);
  const json = await res.json();
  return json.default_branch as string;
}

interface TreeNode {
  type: string;
  path: string;
  sha: string;
  size?: number;
}

export async function fetchRepoFiles(
  owner: string,
  repo: string,
): Promise<{ branch: string; files: RepoFile[]; fileTree: string[] }> {
  const branch = await getDefaultBranch(owner, repo);
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const treeRes = await fetch(`${base}/git/trees/${branch}?recursive=1`, { headers: H });
  if (!treeRes.ok) throw new Error(`GitHub tree fetch failed (${treeRes.status})`);
  const tree = await treeRes.json();

  const nodes = tree.tree as TreeNode[];
  const fileTree: string[] = nodes.filter((n) => n.type === "blob").map((n) => n.path);

  const candidates = nodes.filter(
    (n) => n.type === "blob" && (n.size ?? 0) < 100_000 && shouldIncludePath(n.path),
  );

  // Throttle blob fetches to ~8 concurrent to avoid GitHub's secondary abuse limit.
  const files: RepoFile[] = [];
  const queue = candidates.slice(0, 300);
  const worker = async () => {
    while (queue.length) {
      const node = queue.shift();
      if (!node) break;
      const b = await fetch(`${base}/git/blobs/${node.sha}`, { headers: H }).then((r) => r.json());
      const content = Buffer.from(b.content ?? "", "base64").toString("utf8");
      files.push({ path: node.path, content });
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  files.sort((a, b) => a.path.localeCompare(b.path));

  return { branch, files, fileTree };
}
