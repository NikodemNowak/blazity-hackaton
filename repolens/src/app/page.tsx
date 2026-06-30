"use client";
import { useState } from "react";
import RepoLoader from "@/components/RepoLoader";
import Tabs, { TabKey } from "@/components/Tabs";
import ChatTab from "@/components/ChatTab";
import type { IngestResponse } from "@/lib/types";

// NOTE: functional baseline so Chat is testable end-to-end.
// Bartek owns the real UI shell + styling (plan Task 9–10) and may replace this.
export default function Home() {
  const [info, setInfo] = useState<IngestResponse | null>(null);
  const [tab, setTab] = useState<TabKey>("chat");

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">RepoLens</h1>
      <RepoLoader onLoaded={(r) => setInfo(r)} />

      {!info ? (
        <p className="text-sm text-neutral-400">Load a GitHub repo to begin.</p>
      ) : (
        <>
          <p className="text-xs text-neutral-400">
            {info.repoId} · {info.stats.filesLoaded}/{info.stats.filesTotal} files loaded
            {info.stats.truncated ? " (truncated to fit context)" : ""}
          </p>
          <Tabs active={tab} onChange={setTab} />
          <section className="min-h-[300px]">
            {tab === "chat" && <ChatTab repoId={info.repoId} />}
            {tab === "docs" && (
              <p className="text-sm text-neutral-400">Docs tab — Task 12 (Bartek)</p>
            )}
            {tab === "drift" && (
              <p className="text-sm text-neutral-400">Drift tab — Task 13 (Kuba)</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
