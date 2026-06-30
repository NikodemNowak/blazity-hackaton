import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, fetchRepoFiles } from "@/lib/github";
import { applyBudget } from "@/lib/filter";
import { saveBundle } from "@/lib/bundleStore";
import type { IngestResponse, RepoBundle } from "@/lib/types";

export const runtime = "nodejs"; // needs Buffer + module-level Map
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });

    const { owner, repo } = parseRepoUrl(repoUrl);
    const { branch, files, fileTree } = await fetchRepoFiles(owner, repo);
    const { kept, truncated } = applyBudget(files);

    const bundle: RepoBundle = {
      repoId: `${owner}/${repo}`,
      owner,
      repo,
      branch,
      files: kept,
      fileTree,
      stats: {
        filesLoaded: kept.length,
        filesTotal: fileTree.length,
        totalChars: kept.reduce((n, f) => n + f.content.length, 0),
        truncated,
      },
    };
    saveBundle(bundle);

    const body: IngestResponse = { repoId: bundle.repoId, fileTree, stats: bundle.stats };
    return NextResponse.json(body);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Ingest failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
