"use client";

import { AppShell } from "@/components/app-shell";
import { LayoutToggle } from "@/components/layout-toggle";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { PageHead } from "@/components/ui";
import { THEMES } from "@/lib/themes";

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <PageHead
        title="Settings"
        desc="Control Vellum's visual theme and workspace layout from one place."
      />

      <div className="grid grid-2 settings-grid">
        <section className="card">
          <div className="card-head">
            <span className="card-title">Theme</span>
          </div>
          <div className="card-pad stack">
            <p className="muted">
              Choose a colour system for the entire workspace. Theme tokens drive cards,
              code blocks, forms, navigation, and status colours.
            </p>
            <ThemeSwitcher />
            <div className="theme-list">
              {THEMES.map((theme) => (
                <div key={theme.id} className="theme-row">
                  <span
                    className="theme-row-swatch"
                    style={{ background: theme.bg, boxShadow: `inset 0 0 0 8px ${theme.accent}` }}
                  />
                  <span className="cell-title">{theme.name}</span>
                  {theme.dark && <span className="faint">Dark</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <span className="card-title">Layout</span>
          </div>
          <div className="card-pad stack">
            <p className="muted">
              Use top navigation for narrow or demo screens. Use split workspace when
              there is enough width for side navigation and the context rail.
            </p>
            <LayoutToggle />
            <div className="settings-note">
              The split right rail now collapses below the main workspace on smaller
              screens, so it does not squeeze the content column.
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
