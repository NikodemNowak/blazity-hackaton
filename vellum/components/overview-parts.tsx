// Reusable presentational pieces for the dashboard overview.
// Each layout variant composes these differently — same data, different shape.

import Link from "next/link";
import { Icon } from "./icons";
import { Badge, Meter, StatusBadge } from "./ui";
import type { ActivityItem, DocumentSummary } from "@/lib/types";
import type { OverviewStats } from "@/lib/overview";

export const NAV = [
  { href: "/", label: "Dashboard", icon: Icon.Dashboard },
  { href: "/chat", label: "Chat", icon: Icon.Chat },
  { href: "/generate", label: "Generate", icon: Icon.Generate },
  { href: "/analyze", label: "Analyze", icon: Icon.Analyze },
  { href: "/review", label: "Review", icon: Icon.Review },
  { href: "/documents", label: "Documents", icon: Icon.Docs },
  { href: "/settings", label: "Settings", icon: Icon.Settings },
];

export function Brand({ sub = "Docs, with an LLM" }: { sub?: string }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">V</span>
      <span>
        <span className="brand-name">Vellum</span>
        <span className="brand-sub" style={{ display: "block" }}>
          {sub}
        </span>
      </span>
    </Link>
  );
}

/** Vertical nav (server-rendered; `current` matches a NAV label). */
export function SideNav({ current }: { current: string }) {
  return (
    <nav className="nav">
      <span className="nav-label">Workspace</span>
      {NAV.map((item) => {
        const I = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-item"
            aria-current={item.label === current ? "page" : undefined}
          >
            <I className="nav-icon" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal nav for the top-nav layout. */
export function TopNav({ current }: { current: string }) {
  return (
    <nav className="lt-nav">
      {NAV.map((item) => {
        const I = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.label === current ? "page" : undefined}
          >
            <I width={15} height={15} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const ACTIONS = [
  { href: "/generate", label: "Generate a doc", icon: Icon.Generate, desc: "Draft from code or notes" },
  { href: "/analyze", label: "Analyze a doc", icon: Icon.Analyze, desc: "Score structure & coverage" },
  { href: "/review", label: "Review a doc", icon: Icon.Review, desc: "Find issues & fixes" },
];

const ACTIVITY_TONE = {
  generate: "info",
  analyze: "low",
  review: "med",
} as const;

export function statDefs(stats: OverviewStats) {
  return [
    { label: "Documents", value: stats.documents, hint: "across the workspace" },
    { label: "Average health", value: stats.avgHealth, hint: `${stats.analyzed} analyzed` },
    { label: "Needs attention", value: stats.needsAttention, hint: "stale or low health" },
    { label: "Open issues", value: stats.openIssues, hint: "1 high · 3 medium" },
  ];
}

/** The three quick-action cards (no grid wrapper — caller positions them). */
export function ActionCards() {
  return (
    <>
      {ACTIONS.map((a) => {
        const I = a.icon;
        return (
          <Link key={a.href} href={a.href} className="card card-pad">
            <div className="row-between">
              <I />
              <Icon.Arrow style={{ color: "var(--text-faint)" }} />
            </div>
            <div style={{ marginTop: 12, fontWeight: 600 }}>{a.label}</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              {a.desc}
            </div>
          </Link>
        );
      })}
    </>
  );
}

/** Rows for "documents needing attention" (no card wrapper). */
export function AttentionRows({ docs }: { docs: DocumentSummary[] }) {
  const items = docs
    .filter((d) => d.status === "stale" || (d.health ?? 100) < 80)
    .slice(0, 4);
  return (
    <>
      {items.map((d) => (
        <div
          key={d.id}
          className="card-pad"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="row-between">
            <span className="cell-title">{d.title}</span>
            <StatusBadge status={d.status} />
          </div>
          <div className="row" style={{ marginTop: 8, gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Meter value={d.health ?? 0} />
            </div>
            <span className="faint" style={{ fontSize: 12, width: 28 }}>
              {d.health ?? "—"}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

/** Rows for recent activity (no card wrapper). */
export function ActivityRows({ activity }: { activity: ActivityItem[] }) {
  return (
    <>
      {activity.map((a) => (
        <div
          key={a.id}
          className="card-pad"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="row-between">
            <span className="cell-title">{a.title}</span>
            <Badge tone={ACTIVITY_TONE[a.kind]}>{a.kind}</Badge>
          </div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
            {a.meta}
          </div>
        </div>
      ))}
    </>
  );
}

/** Compact documents table (used by the data-dense layout). */
export function DocsTable({ docs }: { docs: DocumentSummary[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Kind</th>
          <th>Owner</th>
          <th>Status</th>
          <th style={{ textAlign: "right" }}>Health</th>
          <th style={{ textAlign: "right" }}>Updated</th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d) => (
          <tr key={d.id}>
            <td className="cell-title">{d.title}</td>
            <td className="muted" style={{ textTransform: "capitalize" }}>
              {d.kind}
            </td>
            <td className="muted">{d.owner}</td>
            <td>
              <StatusBadge status={d.status} />
            </td>
            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {d.health ?? "—"}
            </td>
            <td className="faint" style={{ textAlign: "right" }}>
              {d.updatedAt}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
