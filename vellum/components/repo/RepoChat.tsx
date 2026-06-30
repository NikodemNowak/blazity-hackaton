"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";
import Markdown from "@/components/repo/Markdown";
import RepoCitation from "@/components/repo/RepoCitation";
import { parseCitations } from "@/lib/repo/citation";
import type { Citation, IngestResponse } from "@/lib/repo/types";

type Msg = {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  citations?: Citation[];
  error?: boolean;
  streaming?: boolean;
};

export default function RepoChat() {
  const [repo, setRepo] = useState<IngestResponse | null>(null);
  const [url, setUrl] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [repoErr, setRepoErr] = useState<string | null>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function loadRepo() {
    if (!url.trim() || loadingRepo) return;
    setLoadingRepo(true);
    setRepoErr(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load repo");
      setRepo(json as IngestResponse);
      setMessages([]);
    } catch (e: unknown) {
      setRepoErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingRepo(false);
    }
  }

  function patchLast(patch: Partial<Msg>) {
    setMessages((prev) => {
      const next = [...prev];
      const i = next.length - 1;
      if (i >= 0 && next[i].role === "assistant") next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  async function send() {
    if (!repo || !input.trim() || streaming) return;
    const question = input;
    setInput("");
    const history = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, text: m.content }));

    setMessages((m) => [
      ...m,
      { role: "user", content: question },
      { role: "assistant", content: "", thinking: "", streaming: true },
    ]);
    setStreaming(true);

    let answer = "";
    let thinking = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.repoId, question, history }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
        patchLast({ content: j.error ?? "Failed", error: true, streaming: false });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let errored = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { type: string; text: string };
          try {
            evt = JSON.parse(line);
          } catch {
            continue;
          }
          if (evt.type === "thinking") thinking += evt.text;
          else if (evt.type === "answer") answer += evt.text;
          else if (evt.type === "error") {
            patchLast({ content: evt.text, error: true, streaming: false });
            errored = true;
          }
        }
        if (!errored) {
          patchLast({ content: parseCitations(answer).clean, thinking });
        }
      }
      if (!errored) {
        const { clean, citations } = parseCitations(answer);
        patchLast({ content: clean, thinking, citations, streaming: false });
      }
    } catch (e: unknown) {
      patchLast({
        content: e instanceof Error ? e.message : "Network error",
        error: true,
        streaming: false,
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="repo-chat">
      {/* Repo loader */}
      <div className="card card-pad">
        <div className="repo-load-row">
          <input
            className="input"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRepo()}
            disabled={loadingRepo}
          />
          <button className="btn btn-primary" onClick={loadRepo} disabled={loadingRepo || !url.trim()}>
            {loadingRepo ? "Loading…" : repo ? "Reload" : "Load repo"}
          </button>
        </div>
        {repoErr && <div className="repo-load-err">{repoErr}</div>}
        {repo && (
          <div className="repo-load-meta">
            <Icon.Docs width={14} height={14} />
            <span className="cell-title">{repo.repoId}</span>
            <span className="faint">
              · {repo.stats.filesLoaded}/{repo.stats.filesTotal} files
              {repo.stats.truncated ? " (truncated)" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Thread */}
      {repo ? (
        <>
          <div className="chat-thread">
            {messages.length === 0 && (
              <div className="empty chat-empty">
                <Icon.Review className="empty-icon" />
                <div>Ask anything about {repo.repoId}.</div>
                <div className="faint" style={{ fontSize: 12 }}>
                  Every answer cites the real code it relies on.
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <Message key={i} m={m} repoId={repo.repoId} />
            ))}
            <div ref={endRef} />
          </div>

          <div className="chat-input card card-pad">
            <textarea
              className="textarea chat-textarea"
              placeholder="How does authentication work? Where is the entry point?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              disabled={streaming}
            />
            <button className="btn btn-primary chat-send" onClick={send} disabled={streaming || !input.trim()}>
              {streaming ? "…" : "Ask"}
              {!streaming && <Icon.Arrow width={15} height={15} />}
            </button>
          </div>
        </>
      ) : (
        <div className="empty chat-empty">
          <Icon.Doc className="empty-icon" />
          <div>Load a GitHub repository to start chatting.</div>
        </div>
      )}
    </div>
  );
}

function Message({ m, repoId }: { m: Msg; repoId: string }) {
  if (m.role === "user") {
    return (
      <div className="msg msg-user">
        <div className="msg-bubble msg-bubble-user">{m.content}</div>
      </div>
    );
  }
  const showTyping = m.streaming && !m.content && !m.thinking;
  return (
    <div className="msg msg-assistant">
      {m.thinking ? <Thinking text={m.thinking} streaming={!!m.streaming} /> : null}
      <div className={cn("msg-bubble", m.error && "msg-bubble-error")}>
        {showTyping ? (
          <span className="typing">
            <span />
            <span />
            <span />
          </span>
        ) : m.error ? (
          m.content
        ) : (
          <>
            <Markdown>{m.content || ""}</Markdown>
            {m.streaming && <span className="stream-cursor" />}
          </>
        )}
      </div>
      {m.citations && m.citations.length > 0 && (
        <div className="msg-sources">
          <div className="msg-sources-label">Sources · {m.citations.length}</div>
          {m.citations.map((c, j) => (
            <RepoCitation key={j} repoId={repoId} citation={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Thinking({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <details className="thinking" open={streaming}>
      <summary className="thinking-summary">
        <span className={cn("thinking-dot", streaming && "thinking-dot-live")} />
        {streaming ? "Thinking…" : "Reasoning"}
      </summary>
      <div className="thinking-body">{text}</div>
    </details>
  );
}
