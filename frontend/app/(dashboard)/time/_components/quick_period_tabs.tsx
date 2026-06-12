"use client";

import { CalendarDays, CalendarRange, Sun } from "lucide-react";
import type { QuickPeriod } from "../_hooks/use_time_entries";

interface Props {
  active:   QuickPeriod | null;
  loading:  boolean;
  onChange: (p: QuickPeriod) => void;
}

const OPTIONS: { value: QuickPeriod; label: string; sub: string; icon: React.ReactNode }[] = [
  { value: "today", label: "Hoy",         sub: "día actual h",  icon: <Sun size={14} />           },
  { value: "week",  label: "Esta semana", sub: "lun → hoy",     icon: <CalendarDays size={14} />  },
  { value: "month", label: "Este mes",    sub: "1° → hoy",      icon: <CalendarRange size={14} /> },
];

export default function QuickPeriodTabs({ active, loading, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            disabled={loading}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-2xl border text-left
              transition-all duration-150
              ${isActive
                ? "bg-violet-50 border-violet-300 shadow-sm"
                : "bg-white border-gray-200 hover:border-violet-200 hover:bg-gray-50/60"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className={`shrink-0 transition-colors ${isActive ? "text-violet-500" : "text-gray-400"}`}>
              {opt.icon}
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-semibold leading-tight transition-colors ${isActive ? "text-violet-700" : "text-gray-600"}`}>
                {opt.label}
              </span>
              <span className={`block text-xs mt-0.5 transition-colors ${isActive ? "text-violet-400" : "text-gray-400"}`}>
                {opt.sub}
              </span>
            </span>
            {isActive && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}