import { NextRequest, NextResponse } from "next/server";
import { getBundle } from "@/lib/repo/bundleStore";
import { getSnippet } from "@/lib/repo/snippet";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { repoId, citation } = await req.json();
    if (!citation || typeof citation.path !== "string") {
      return NextResponse.json({ error: "citation is required" }, { status: 400 });
    }
    const bundle = getBundle(repoId);
    if (!bundle) return NextResponse.json({ error: "Repo not loaded" }, { status: 404 });
    const snip = getSnippet(bundle, citation);
    if (!snip) return NextResponse.json({ error: "File not found" }, { status: 404 });
    return NextResponse.json(snip);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Snippet failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
