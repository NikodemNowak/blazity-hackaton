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
    <div className="overflow-hidden rounded-md border border-stone-800 bg-stone-950 text-xs shadow-sm">
      <div className="border-b border-stone-800 px-3 py-2 font-mono text-stone-300">
        {citation.path}:{citation.startLine}-{citation.endLine}
      </div>
      {err && <p className="px-3 py-2 text-red-300">{err}</p>}
      {lines && (
        <pre className="overflow-x-auto p-3 leading-5 text-stone-100">
          {lines.map((l) => (
            <div key={l.n}>
              <span className="mr-3 inline-block w-8 select-none text-right text-stone-500">
                {l.n}
              </span>
              {l.text}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
