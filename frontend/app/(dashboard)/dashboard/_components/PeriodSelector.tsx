"use client";

import { useState } from "react";

export type Period = "daily" | "weekly" | "monthly" | "custom";

export interface DateRange {
  from: string;
  to: string;
}

interface Props {
  onChange: (range: DateRange) => void;
}

function getRange(period: Period, customFrom?: string, customTo?: string): DateRange {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "daily") {
    const today = fmt(now);
    return { from: today, to: today };
  }

  if (period === "weekly") {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: fmt(monday), to: fmt(sunday) };
  }

  if (period === "monthly") {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`;
    return { from, to };
  }

  return { from: customFrom ?? fmt(now), to: customTo ?? fmt(now) };
}

const OPTIONS: { id: Period; label: string }[] = [
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "custom", label: "Rango personalizado" },
];

export default function PeriodSelector({ onChange }: Props) {
  const [active, setActive] = useState<Period>("monthly");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const handleSelect = (period: Period) => {
    setActive(period);
    if (period !== "custom") {
      onChange(getRange(period));
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-6 flex flex-wrap items-center gap-3 shadow-sm">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Período:</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => handleSelect(o.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              active === o.id
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {active === "custom" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Desde</span>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <span className="text-xs text-gray-500">Hasta</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
            className="px-4 py-1.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}