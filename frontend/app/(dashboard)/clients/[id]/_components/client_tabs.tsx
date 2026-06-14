"use client";

export const TABS = [
  { id: "general",  label: "Vista General" },
  { id: "projects", label: "Proyectos" },
  { id: "receipts", label: "Recibos" },
  { id: "tasks",    label: "Tareas" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function ClientTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 border-b border-gray-100 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
            active === tab.id
              ? "bg-white border border-b-white border-gray-100 text-violet-600 -mb-px"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}