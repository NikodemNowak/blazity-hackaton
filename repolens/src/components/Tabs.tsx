"use client";
export type TabKey = "chat" | "docs" | "drift";

export default function Tabs({
  active,
  onChange,
  disabled = false,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  disabled?: boolean;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "chat", label: "Chat" },
    { key: "docs", label: "Docs" },
    { key: "drift", label: "Drift" },
  ];
  return (
    <div className="flex rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          disabled={disabled}
          className={`min-h-10 flex-1 rounded-md px-4 text-sm font-medium transition ${
            active === t.key
              ? "bg-stone-950 text-white"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-950 disabled:hover:bg-transparent disabled:hover:text-stone-500"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
