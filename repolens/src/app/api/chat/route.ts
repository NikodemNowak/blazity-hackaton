import { NextRequest, NextResponse } from "next/server";
import { getBundle } from "@/lib/bundleStore";
import { askLLM, buildRepoContext } from "@/lib/llm";
import { MODELS, SETTINGS } from "@/lib/config";
import type { ChatResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const FORMAT = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      answer: { type: "string" },
      citations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string" },
            startLine: { type: "integer" },
            endLine: { type: "integer" },
          },
          required: ["path", "startLine", "endLine"],
          additionalProperties: false,
        },
      },
    },
    required: ["answer", "citations"],
    additionalProperties: false,
  },
} as const;

export async function POST(req: NextRequest) {
  const { repoId, question, history } = await req.json();
  const bundle = getBundle(repoId);
  if (!bundle) return NextResponse.json({ error: "Repo not loaded" }, { status: 404 });

  const system =
    "You answer questions about a codebase. Use ONLY the provided files. " +
    "Cite the exact file paths and line ranges that support your answer. " +
    "Every citation's path must appear in the file tree and lines must exist. " +
    "If the answer isn't in the code, say so.";

  const priorTurns = ((history ?? []) as { role: string; text: string }[])
    .map((m) => `${m.role}: ${m.text}`)
    .join("\n");

  // Repo context goes in the cached prefix (stable across turns); only the
  // conversation + question are volatile.
  const user = `CONVERSATION SO FAR:\n${priorTurns}\n\nQUESTION: ${question}`;

  const raw = await askLLM({
    system,
    cacheContext: buildRepoContext(bundle),
    user,
    model: MODELS.chat,
    maxTokens: SETTINGS.maxTokensChat,
    outputFormat: FORMAT,
  });

  let parsed: ChatResponse;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { answer: raw || "No answer.", citations: [] };
  }
  return NextResponse.json(parsed);
}
