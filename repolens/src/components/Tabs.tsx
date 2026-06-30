"use client";
export type TabKey = "chat" | "docs" | "drift";
export type AppTabKey = TabKey | "settings";

export default function Tabs({
  active,
  onChange,
  disabled = false,
}: {
  active: AppTabKey;
  onChange: (t: AppTabKey) => void;
  disabled?: boolean;
}) {
  const tabs: { key: AppTabKey; label: string; availableWithoutRepo?: boolean }[] = [
    { key: "chat", label: "Chat" },
    { key: "docs", label: "Docs" },
    { key: "drift", label: "Drift" },
    { key: "settings", label: "Settings", availableWithoutRepo: true },
  ];
  return (
    <div className="grid grid-cols-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm sm:flex">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          disabled={disabled && !t.availableWithoutRepo}
          className={`min-h-10 min-w-0 flex-1 rounded-md px-2 text-sm font-medium transition sm:px-4 ${
            active === t.key
              ? "bg-[var(--primary)] text-[var(--primaryText)]"
              : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)] disabled:hover:bg-transparent disabled:hover:text-[var(--muted)]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
