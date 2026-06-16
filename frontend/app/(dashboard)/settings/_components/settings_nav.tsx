"use client";

// Settings sidebar navigation. Owns the TABS definition and TabId type.

import { User } from "lucide-react";

export const TABS = [
  { id: "profile", label: "Perfil", icon: User },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function SettingsNav({ active, onChange }: Props) {
  return (
    <nav className="w-full lg:w-52 shrink-0 bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-2">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              "flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200"
                : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
            ].join(" ")}
          >
            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}