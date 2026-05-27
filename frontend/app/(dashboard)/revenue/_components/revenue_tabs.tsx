"use client";

export type RevenueTab = "general" | "client" | "project" | "period";

const TABS: { id: RevenueTab; label: string }[] = [
  { id: "general", label: "Vista General" },
  { id: "client",  label: "Por Cliente" },
  { id: "project", label: "Por Proyecto" },
  { id: "period",  label: "Por Período" },
];

interface Props {
  active: RevenueTab;
  onChange: (tab: RevenueTab) => void;
}

export default function RevenueTabs({ active, onChange }: Props) {
  return (
    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 w-fit mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            active === tab.id
              ? "bg-green-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}