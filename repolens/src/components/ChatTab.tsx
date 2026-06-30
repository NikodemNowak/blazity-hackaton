"use client";
import { useState } from "react";
import CitationView from "@/components/CitationView";
import type { ChatResponse, Citation } from "@/lib/types";

type Msg = { role: "user" | "assistant"; text: string; citations?: Citation[]; error?: boolean };

export default function ChatTab({ repoId }: { repoId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!q.trim() || loading) return;
    const question = q;
    const history = msgs.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, question, history }),
      });
      const json = (await res.json()) as ChatResponse & { error?: string };
      if (!res.ok || json.error) {
        setMsgs((m) => [
          ...m,
          { role: "assistant", text: json.error ?? `Request failed (${res.status})`, error: true },
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          { role: "assistant", text: json.answer || "(no answer)", citations: json.citations },
        ]);
      }
    } catch (e: unknown) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: e instanceof Error ? e.message : "Network error", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[520px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm sm:min-h-[560px]">
      <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--text)]">Chat with the repo</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ask about architecture, data flow, or a specific file. Answers should cite real lines.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 py-4 sm:px-5 sm:py-5">
        {msgs.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--fieldBorder)] bg-[var(--field)] p-5">
            <p className="text-sm font-medium text-[var(--text)]">Try a focused question.</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              For example: How does repo ingestion work? Or: Where is rate limiting applied?
            </p>
          </div>
        )}

        {msgs.map((m, i) => (
          <article
            key={i}
            className={`rounded-lg border p-4 ${
              m.error
                ? "border-red-200 bg-red-50 text-red-700"
                : m.role === "user"
                  ? "border-[var(--border)] bg-[var(--soft)] text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--subtleText)]"
            }`}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {m.role}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-6">{m.text}</div>
            {m.citations?.length ? (
              <div className="mt-3 space-y-3">
                {m.citations.map((c, j) => (
                  <CitationView
                    key={`${c.path}-${c.startLine}-${c.endLine}-${j}`}
                    repoId={repoId}
                    citation={c}
                  />
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {loading && <p className="text-sm text-[var(--muted)]">Thinking...</p>}
      </div>

      <div className="border-t border-[var(--border)] p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            className="min-h-24 flex-1 resize-none rounded-md border border-[var(--fieldBorder)] bg-[var(--field)] px-3 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--surface)]"
            placeholder="How does authentication, routing, or repo ingestion work?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loading) send();
            }}
          />
          <button
            className="min-h-11 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primaryText)] transition opacity-100 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--disabled)] sm:self-end"
            onClick={send}
            disabled={loading || !q.trim()}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
