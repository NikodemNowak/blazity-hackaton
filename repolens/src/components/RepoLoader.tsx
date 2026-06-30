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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="min-h-11 flex-1 rounded-md border border-[var(--fieldBorder)] bg-[var(--field)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--surface)]"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button
          className="min-h-11 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primaryText)] transition opacity-100 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--disabled)]"
          onClick={load}
          disabled={loading || !url}
        >
          {loading ? "Loading..." : "Load repo"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
