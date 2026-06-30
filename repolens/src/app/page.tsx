"use client";
import type { CSSProperties } from "react";
import { useState } from "react";
import RepoLoader from "@/components/RepoLoader";
import Tabs, { type AppTabKey } from "@/components/Tabs";
import ChatTab from "@/components/ChatTab";
import type { IngestResponse } from "@/lib/types";

type ThemeKey = "paper" | "graphite" | "green";
type SidebarSide = "left" | "right";

const themes: Record<
  ThemeKey,
  {
    label: string;
    style: CSSProperties;
    swatch: string;
  }
> = {
  paper: {
    label: "Paper",
    swatch: "#f6f4ef",
    style: {
      "--page": "#f6f4ef",
      "--surface": "#ffffff",
      "--soft": "#f2f0ea",
      "--field": "#faf9f5",
      "--border": "#e3ded2",
      "--fieldBorder": "#cfc7b8",
      "--text": "#171717",
      "--subtleText": "#44403a",
      "--muted": "#78716c",
      "--primary": "#171717",
      "--primaryText": "#ffffff",
      "--accent": "#f2d36b",
      "--disabled": "#d6d3d1",
      "--code": "#171717",
      "--codeBorder": "#2f2b25",
      "--codeText": "#f5f5f4",
      "--codeMuted": "#a8a29e",
    } as CSSProperties,
  },
  graphite: {
    label: "Graphite",
    swatch: "#202124",
    style: {
      "--page": "#202124",
      "--surface": "#f7f7f2",
      "--soft": "#ecebe3",
      "--field": "#fbfaf6",
      "--border": "#d6d2c6",
      "--fieldBorder": "#bdb7aa",
      "--text": "#171717",
      "--subtleText": "#3f3f37",
      "--muted": "#6f6b62",
      "--primary": "#202124",
      "--primaryText": "#ffffff",
      "--accent": "#9cc3ff",
      "--disabled": "#c9c5bb",
      "--code": "#111318",
      "--codeBorder": "#2c3038",
      "--codeText": "#f4f7fb",
      "--codeMuted": "#9aa4b2",
    } as CSSProperties,
  },
  green: {
    label: "Green",
    swatch: "#dfead7",
    style: {
      "--page": "#dfead7",
      "--surface": "#fffef9",
      "--soft": "#edf3e7",
      "--field": "#f8fbf4",
      "--border": "#cbd9c1",
      "--fieldBorder": "#adbea3",
      "--text": "#172017",
      "--subtleText": "#3d493b",
      "--muted": "#687762",
      "--primary": "#244a2f",
      "--primaryText": "#ffffff",
      "--accent": "#f0c45d",
      "--disabled": "#c8d2c0",
      "--code": "#142118",
      "--codeBorder": "#2b3c2f",
      "--codeText": "#f5fff5",
      "--codeMuted": "#9db59f",
    } as CSSProperties,
  },
};

function FormatNumber({ value }: { value: number }) {
  return <>{new Intl.NumberFormat("en").format(value)}</>;
}

function EmptyPanel({ title, body, action }: { title: string; body: string; action: string }) {
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:min-h-[360px] sm:p-6">
      <div>
        <div className="mb-4 h-1 w-12 rounded-full bg-[var(--accent)]" />
        <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{body}</p>
      </div>
      <button
        type="button"
        disabled
        className="mt-8 w-fit rounded-md border border-[var(--border)] bg-[var(--field)] px-4 py-2 text-sm font-medium text-[var(--muted)] opacity-70"
      >
        {action}
      </button>
    </div>
  );
}

function SettingsPanel({
  theme,
  onThemeChange,
  sidebarSide,
  onSidebarSideChange,
}: {
  theme: ThemeKey;
  onThemeChange: (theme: ThemeKey) => void;
  sidebarSide: SidebarSide;
  onSidebarSideChange: (side: SidebarSide) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--text)]">Settings</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Appearance and layout options are kept here so the workspace stays focused while
          the loaded repository and chat remain unchanged.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Palette</h3>
          <div className="mt-4 grid gap-2">
            {(Object.keys(themes) as ThemeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onThemeChange(key)}
                className={`flex min-h-12 items-center gap-3 rounded-md border px-3 text-left text-sm transition ${
                  theme === key
                    ? "border-[var(--primary)] bg-[var(--surface)] text-[var(--text)]"
                    : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border border-[var(--border)]"
                  style={{ background: themes[key].swatch }}
                />
                {themes[key].label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Repository panel</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["left", "right"] as SidebarSide[]).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => onSidebarSideChange(side)}
                className={`min-h-12 rounded-md border px-3 text-sm font-medium capitalize transition ${
                  sidebarSide === side
                    ? "border-[var(--primary)] bg-[var(--surface)] text-[var(--text)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                }`}
              >
                {side}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            On phones the panel stacks above the workspace regardless of this setting.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  const [info, setInfo] = useState<IngestResponse | null>(null);
  const [tab, setTab] = useState<AppTabKey>("chat");
  const [theme, setTheme] = useState<ThemeKey>("paper");
  const [sidebarSide, setSidebarSide] = useState<SidebarSide>("left");

  const mainFirst = sidebarSide === "right";
  const appStyle = themes[theme].style;

  return (
    <main className="min-h-screen bg-[var(--page)] text-[var(--text)]" style={appStyle}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <header className="grid gap-5 border-b border-[var(--border)] pb-5 lg:grid-cols-[1fr_minmax(360px,560px)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              AI for codebase content
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--text)] sm:text-4xl">
              RepoLens
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Load a GitHub repository, ask questions against the code, and keep every answer
              grounded in file and line evidence.
            </p>
          </div>
          <RepoLoader onLoaded={(r) => setInfo(r)} />
        </header>

        <section
          className={`grid flex-1 gap-4 py-4 lg:gap-5 lg:py-5 ${
            sidebarSide === "right" ? "lg:grid-cols-[minmax(0,1fr)_300px]" : "lg:grid-cols-[300px_minmax(0,1fr)]"
          }`}
        >
          <aside
            className={`min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] ${
              mainFirst ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <div className="flex h-full flex-col">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Repository
                </p>
                {info ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="break-all text-sm font-semibold text-[var(--text)]">
                        {info.repoId}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        <FormatNumber value={info.stats.filesLoaded} /> of{" "}
                        <FormatNumber value={info.stats.filesTotal} /> files loaded
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-[var(--soft)] p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                          Chars
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                          <FormatNumber value={info.stats.totalChars} />
                        </p>
                      </div>
                      <div className="rounded-md bg-[var(--soft)] p-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                          Budget
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                          {info.stats.truncated ? "Capped" : "Full"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    Paste a GitHub URL above to create the in-memory bundle used by chat,
                    snippets, docs, and drift checks.
                  </p>
                )}
              </div>

              {info && (
                <div className="mt-5 min-h-0 flex-1 border-t border-[var(--border)] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    File tree
                  </p>
                  <div className="mt-3 max-h-64 overflow-auto rounded-md bg-[var(--code)] p-3 font-mono text-xs text-[var(--codeText)] lg:max-h-[46vh]">
                    {info.fileTree.slice(0, 120).map((path) => (
                      <div key={path} className="truncate py-0.5" title={path}>
                        {path}
                      </div>
                    ))}
                    {info.fileTree.length > 120 && (
                      <div className="pt-2 text-[var(--codeMuted)]">
                        +{info.fileTree.length - 120} more files
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <section className={`min-w-0 ${mainFirst ? "lg:order-1" : "lg:order-2"}`}>
            <Tabs active={tab} onChange={setTab} disabled={!info} />
            <div className="mt-4">
              {tab === "settings" ? (
                <SettingsPanel
                  theme={theme}
                  onThemeChange={setTheme}
                  sidebarSide={sidebarSide}
                  onSidebarSideChange={setSidebarSide}
                />
              ) : !info ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-[var(--fieldBorder)] bg-[var(--surface)]/70 p-6 text-center sm:min-h-[520px] sm:p-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text)]">No repository loaded</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
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
