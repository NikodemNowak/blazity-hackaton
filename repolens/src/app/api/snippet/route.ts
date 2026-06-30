import { NextRequest, NextResponse } from "next/server";
import { getBundle } from "@/lib/bundleStore";
import { getSnippet } from "@/lib/snippet";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { repoId, citation } = await req.json();
  const bundle = getBundle(repoId);
  if (!bundle) return NextResponse.json({ error: "Repo not loaded" }, { status: 404 });
  const snip = getSnippet(bundle, citation);
  if (!snip) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.json(snip);
}
