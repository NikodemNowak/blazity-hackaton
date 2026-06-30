import Anthropic from "@anthropic-ai/sdk";
import { PROVIDER, MODELS } from "./config";
import type { RepoBundle } from "./types";

// Lazy singleton: constructing the client at module load would throw when
// ANTHROPIC_API_KEY is unset (e.g. during `next build`), breaking the build.
let _anthropic: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY
  return _anthropic;
}

export async function askLLM(opts: {
  system: string;
  user: string;
  /**
   * Large, stable context (e.g. the repo bundle) placed in a cacheable position.
   * Identical across calls for the same repo, so Claude prompt-caches it
   * (~90% cheaper + faster on follow-up turns). Put volatile text in `user`.
   */
  cacheContext?: string;
  model?: string;
  maxTokens?: number;
  outputFormat?: object; // JSON-schema format (provider-translated)
}): Promise<string> {
  const model = opts.model ?? MODELS.chat;
  const maxTokens = opts.maxTokens ?? 8000;

  if (PROVIDER === "anthropic") {
    // System = small instructions + (optional) cached repo context as a stable prefix.
    const system = opts.cacheContext
      ? [
          { type: "text", text: opts.system },
          {
            type: "text",
            text: opts.cacheContext,
            cache_control: { type: "ephemeral" },
          },
        ]
      : opts.system;

    const res = await anthropic().messages.create({
      model,
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: opts.user }],
      ...(opts.outputFormat ? { output_config: { format: opts.outputFormat } } : {}),
    } as Anthropic.MessageCreateParamsNonStreaming);

    const text = res.content.find((b) => b.type === "text");
    return text && "text" in text ? text.text : "";
  }

  // Other providers are added here — see the "Provider & model configuration"
  // section of the plan. Until implemented, fail loudly rather than silently.
  throw new Error(`AI_PROVIDER="${PROVIDER}" not implemented yet`);
}

export function buildRepoContext(bundle: RepoBundle): string {
  const tree = bundle.fileTree.join("\n");
  const body = bundle.files
    .map((f) => {
      const numbered = f.content
        .split("\n")
        .map((line, i) => `${i + 1}\t${line}`)
        .join("\n");
      return `=== FILE: ${f.path} ===\n${numbered}`;
    })
    .join("\n\n");
  return `Repository: ${bundle.owner}/${bundle.repo} (branch ${bundle.branch})\n\nFILE TREE:\n${tree}\n\nFILE CONTENTS (each line prefixed with its 1-indexed line number):\n${body}`;
}
