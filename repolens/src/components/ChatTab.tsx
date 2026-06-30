"use client";
import { useState } from "react";
import CitationView from "@/components/CitationView";
import type { ChatResponse, Citation } from "@/lib/types";

type Msg = { role: "user" | "assistant"; text: string; citations?: Citation[] };

export default function ChatTab({ repoId }: { repoId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!q.trim()) return;
    const question = q;
    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, question, history }),
      });
      const json = (await res.json()) as ChatResponse;
      setMsgs((m) => [...m, { role: "assistant", text: json.answer, citations: json.citations }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-neutral-100" : "text-neutral-300"}>
            <div className="text-xs uppercase text-neutral-500">{m.role}</div>
            <div className="whitespace-pre-wrap text-sm">{m.text}</div>
            {m.citations?.map((c, j) => (
              <CitationView key={j} repoId={repoId} citation={c} />
            ))}
          </div>
        ))}
        {loading && <p className="text-sm text-neutral-500">Thinking…</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          placeholder="How does X work?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && send()}
        />
        <button
          className="rounded bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-50"
          onClick={send}
          disabled={loading}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
