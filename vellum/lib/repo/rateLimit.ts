// Minimal in-memory per-key sliding-window rate limiter. Mitigates token/cost
// abuse on the unauthenticated API routes (anyone reaching the deployment could
// otherwise hammer /api/chat to burn Claude tokens). Per-process only — fine for
// the single-instance demo deploy; not a substitute for real auth at scale.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}
