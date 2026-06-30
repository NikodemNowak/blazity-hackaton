"use client";
import { useState } from "react";
import type { IngestResponse } from "@/lib/types";

export default function RepoLoader({ onLoaded }: { onLoaded: (r: IngestResponse) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      onLoaded(json as IngestResponse);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button
          className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
          onClick={load}
          disabled={loading || !url}
        >
          {loading ? "Loading…" : "Load repo"}
        </button>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}
