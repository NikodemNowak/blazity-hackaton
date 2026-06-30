"use client";
import { useEffect, useState } from "react";
import type { Citation } from "@/lib/repo/types";

// "Checked, not trusted": renders the actual source lines a citation points to,
// fetched from the in-memory bundle via /api/snippet.
export default function RepoCitation({ repoId, citation }: { repoId: string; citation: Citation }) {
  const [lines, setLines] = useState<{ n: number; text: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/snippet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, citation }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.error) setErr(j.error);
        else setLines(j.lines);
      })
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [repoId, citation]);

  return (
    <div className="repo-cite">
      <div className="repo-cite-head">
        <span className="repo-cite-path">{citation.path}</span>
        <span className="repo-cite-lines">
          {citation.startLine}-{citation.endLine}
        </span>
      </div>
      {err && <div className="repo-cite-err">{err}</div>}
      {lines && (
        <pre className="repo-cite-code">
          {lines.map((l) => (
            <div key={l.n} className="repo-cite-line">
              <span className="repo-cite-num">{l.n}</span>
              <span className="repo-cite-text">{l.text || " "}</span>
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
