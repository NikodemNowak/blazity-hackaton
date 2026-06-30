"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Brand, SideNav, TopNav } from "./overview-parts";
import { useLayoutMode } from "./layout-mode";

// pathname prefix -> nav label (order matters; "/" checked last)
const ROUTE_LABEL: Array<[string, string]> = [
  ["/chat", "Chat"],
  ["/generate", "Generate"],
  ["/analyze", "Analyze"],
  ["/review", "Review"],
  ["/documents", "Documents"],
  ["/settings", "Settings"],
  ["/", "Dashboard"],
];

// Supplementary context shown in the right rail (split mode only). Non-essential
// by design, so the page is fully usable in top-nav mode without it.
const CONTEXT: Record<string, string[]> = {
  Dashboard: [
    "Health scores come from the last analysis.",
    "Documents below 70 are flagged for attention.",
    "Open Generate to draft a doc from code or notes.",
  ],
  Chat: [
    "Load a public or private GitHub repo by URL.",
    "Answers cite the exact file and lines they rely on.",
    "Expand “Reasoning” to see how the model thought.",
  ],
  Generate: [
    "Load a repository before drafting docs.",
    "Language profiles choose conventions such as pydoc, TypeDoc, godoc, or rustdoc.",
    "The draft returns as Markdown you can copy.",
  ],
  Analyze: [
    "Paste an existing doc to score it.",
    "Metrics cover readability, coverage, and structure.",
    "Gaps list the sections the doc is missing.",
  ],
  Review: [
    "Issues are grouped by severity and category.",
    "Each issue includes a suggested fix.",
    "Filter the list by severity.",
  ],
  Documents: [
    "Health reflects the last analysis run.",
    "Status is the editorial state of the doc.",
    "Open a doc to analyze or review it.",
  ],
  Settings: [
    "Themes and layout live here.",
    "Split mode keeps navigation, work area, and context separate.",
    "On smaller screens the right rail collapses below the main content.",
  ],
};

function labelFor(pathname: string): string {
  for (const [prefix, label] of ROUTE_LABEL) {
    if (prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)) {
      return label;
    }
  }
  return "Dashboard";
}

function RailContext({ label }: { label: string }) {
  const tips = CONTEXT[label] ?? CONTEXT.Dashboard;
  return (
    <>
      <div>
        <h4>{label}</h4>
        <ul className="notes">
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Repository mode</div>
        <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>
          Chat and generation use live repo bundles when keys are configured.
        </div>
      </div>
    </>
  );
}

export function AppShell({
  children,
}: {
  /** Accepted for call-site clarity; pages render their own PageHead. */
  title?: string;
  children: ReactNode;
}) {
  const { mode } = useLayoutMode();
  const pathname = usePathname();
  const current = labelFor(pathname);

  if (mode === "topnav") {
    return (
      <div className="lt-shell">
        <header className="lt-topbar">
          <Brand sub="" />
          <TopNav current={current} />
        </header>
        <main className="lt-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="ls-shell">
      <aside className="sidebar">
        <Brand />
        <SideNav current={current} />
      </aside>
      <main className="ls-main">{children}</main>
      <aside className="ls-rail">
        <RailContext label={current} />
      </aside>
    </div>
  );
}
