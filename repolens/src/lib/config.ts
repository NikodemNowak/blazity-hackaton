// Provider + per-task model selection. Override any of these in .env.local.
export const PROVIDER = (process.env.AI_PROVIDER ?? "anthropic") as
  | "anthropic"
  | "openai"
  | "google";

// Per-task model IDs. Defaults target Claude; override per provider in env.
export const MODELS = {
  chat: process.env.MODEL_CHAT ?? "claude-sonnet-4-6", // fast, interactive
  docs: process.env.MODEL_DOCS ?? "claude-opus-4-8", // hardest reasoning
  drift: process.env.MODEL_DRIFT ?? "claude-opus-4-8", // hardest reasoning
} as const;

// Tunables (safe defaults; override in env if needed).
export const SETTINGS = {
  maxTokensChat: Number(process.env.MAX_TOKENS_CHAT ?? 4000),
  maxTokensDocs: Number(process.env.MAX_TOKENS_DOCS ?? 8000),
  maxTokensDrift: Number(process.env.MAX_TOKENS_DRIFT ?? 6000),
};
