"use client";
import { useEffect, useState } from "react";
import type { Citation } from "@/lib/types";

export default function CitationView({ repoId, citation }: { repoId: string; citation: Citation }) {
  const [lines, setLines] = useState<{ n: number; text: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/snippet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, citation }),
    })
      .then((r) => r.json())
      .then((j) => (j.error ? setErr(j.error) : setLines(j.lines)))
      .catch((e) => setErr(String(e)));
  }, [repoId, citation]);

  return (
    <div className="my-2 overflow-hidden rounded border border-neutral-800 bg-neutral-950 text-xs">
      <div className="border-b border-neutral-800 px-2 py-1 font-mono text-neutral-400">
        {citation.path}:{citation.startLine}-{citation.endLine}
      </div>
      {err && <p className="px-2 py-1 text-red-400">{err}</p>}
      {lines && (
        <pre className="overflow-x-auto p-2">
          {lines.map((l) => (
            <div key={l.n}>
              <span className="mr-3 select-none text-neutral-600">{l.n}</span>
              {l.text}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
