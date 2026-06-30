"use client";
import { AppShell } from "@/components/app-shell";
import { PageHead } from "@/components/ui";
import RepoChat from "@/components/repo/RepoChat";

export default function ChatPage() {
  return (
    <AppShell title="Chat">
      <PageHead
        title="Chat with a repository"
        desc="Load a GitHub repo and ask questions — every answer cites the real code it relies on."
      />
      <RepoChat />
    </AppShell>
  );
}
