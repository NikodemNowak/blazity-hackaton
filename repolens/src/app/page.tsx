"use client";
import { useState } from "react";
import RepoLoader from "@/components/RepoLoader";
import Tabs, { TabKey } from "@/components/Tabs";
import ChatTab from "@/components/ChatTab";
import type { IngestResponse } from "@/lib/types";

function FormatNumber({ value }: { value: number }) {
  return <>{new Intl.NumberFormat("en").format(value)}</>;
}

function EmptyPanel({ title, body, action }: { title: string; body: string; action: string }) {
  return (
    <div className="flex min-h-[360px] flex-col justify-between rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <div className="mb-4 h-1 w-12 rounded-full bg-amber-400" />
        <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{body}</p>
      </div>
      <button
        type="button"
        disabled
        className="mt-8 w-fit rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-400"
      >
        {action}
      </button>
    </div>
  );
}

export default function Home() {
  const [info, setInfo] = useState<IngestResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("chat");

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="grid gap-5 border-b border-stone-300 pb-5 lg:grid-cols-[1fr_minmax(420px,560px)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              AI for codebase content
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950 sm:text-4xl">
              RepoLens
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Load a GitHub repository, ask questions against the code, and keep every answer
              grounded in file and line evidence.
            </p>
          </div>
          <RepoLoader onLoaded={(r) => setInfo(r)} />
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
            <div className="flex h-full flex-col">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Repository
                </p>
                {info ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="break-all text-sm font-semibold text-stone-950">{info.repoId}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        <FormatNumber value={info.stats.filesLoaded} /> of{" "}
                        <FormatNumber value={info.stats.filesTotal} /> files loaded
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-stone-100 p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
                          Chars
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                          <FormatNumber value={info.stats.totalChars} />
                        </p>
                      </div>
                      <div className="rounded-md bg-stone-100 p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">
                          Budget
                        </p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">
                          {info.stats.truncated ? "Capped" : "Full"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-stone-600">
                    Paste a GitHub URL above to create the in-memory bundle used by chat,
                    snippets, docs, and drift checks.
                  </p>
                )}
              </div>

              {info && (
                <div className="mt-5 min-h-0 flex-1 border-t border-stone-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    File tree
                  </p>
                  <div className="mt-3 max-h-[46vh] overflow-auto rounded-md bg-stone-950 p-3 font-mono text-xs text-stone-200">
                    {info.fileTree.slice(0, 120).map((path) => (
                      <div key={path} className="truncate py-0.5" title={path}>
                        {path}
                      </div>
                    ))}
                    {info.fileTree.length > 120 && (
                      <div className="pt-2 text-stone-500">
                        +{info.fileTree.length - 120} more files
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <Tabs active={tab} onChange={setTab} disabled={!info} />
            <div className="mt-4">
              {!info ? (
                <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white/70 p-8 text-center">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-950">No repository loaded</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                      RepoLens keeps the bundle in server memory, so loading a repository is the
                      first step before any tab can use citations.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {tab === "chat" && <ChatTab repoId={info.repoId} />}
                  {tab === "docs" && (
                    <EmptyPanel
                      title="Generate docs"
                      body="This surface is reserved for onboarding and architecture docs generated from the loaded bundle. The API route is not wired yet, so the UI keeps the contract visible without pretending the feature is complete."
                      action="Generate unavailable"
                    />
                  )}
                  {tab === "drift" && (
                    <EmptyPanel
                      title="Review drift"
                      body="This surface will compare README and docs claims against the loaded code and cite the contradicting file lines. The backend route still needs to land."
                      action="Run check unavailable"
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
