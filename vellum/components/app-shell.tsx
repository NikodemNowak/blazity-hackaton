"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Brand, SideNav, TopNav } from "./overview-parts";
import { ThemeSwitcher } from "./theme-switcher";
import { LayoutToggle } from "./layout-toggle";
import { useLayoutMode } from "./layout-mode";

// pathname prefix -> nav label (order matters; "/" checked last)
const ROUTE_LABEL: Array<[string, string]> = [
  ["/chat", "Chat"],
  ["/generate", "Generate"],
  ["/analyze", "Analyze"],
  ["/review", "Review"],
  ["/drift", "Drift"],
  ["/documents", "Documents"],
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
    "Pick a format and tone, then paste source material.",
    "The draft returns as Markdown you can copy.",
    "Model notes explain what was inferred.",
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
  Drift: [
    "Paste a GitHub repo URL to check docs against code.",
    "Each finding cites the contradicting code — checked, not trusted.",
    "Filter findings by severity.",
  ],
  Documents: [
    "Health reflects the last analysis run.",
    "Status is the editorial state of the doc.",
    "Open a doc to analyze or review it.",
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
        <div style={{ fontSize: 12, fontWeight: 600 }}>Mock mode</div>
        <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>
          Responses are simulated. Swap <span className="kbd">lib/api.ts</span>{" "}
          for live calls.
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
          <div className="row" style={{ marginLeft: "auto", gap: 10 }}>
            <LayoutToggle />
            <ThemeSwitcher />
          </div>
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
        <div className="row-between">
          <LayoutToggle />
          <ThemeSwitcher />
        </div>
        <RailContext label={current} />
      </aside>
    </div>
  );
}
