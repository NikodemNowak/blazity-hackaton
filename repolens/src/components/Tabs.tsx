"use client";
export type TabKey = "chat" | "docs" | "drift";

export default function Tabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "chat", label: "Chat" },
    { key: "docs", label: "Docs" },
    { key: "drift", label: "Drift" },
  ];
  return (
    <div className="flex gap-1 border-b border-neutral-800">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm ${
            active === t.key ? "border-b-2 border-neutral-100 font-medium" : "text-neutral-400"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
