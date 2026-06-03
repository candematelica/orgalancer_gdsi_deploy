"use client";

export interface Tab<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs:     Tab<T>[];
  active:   T;
  onChange: (tab: T) => void;
  activeColor?: string; // tailwind bg class, default green
}

export default function SectionTabs<T extends string>({
  tabs, active, onChange, activeColor = "bg-green-600",
}: Props<T>) {
  return (
    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 w-fit mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
            active === tab.id
              ? `${activeColor} text-white shadow-sm`
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}