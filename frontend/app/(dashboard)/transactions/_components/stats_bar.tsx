"use client";

import { useState, useRef, useEffect } from "react";
import { fmt } from "../_utils/fmt";

export interface BarItem {
  id:     string;
  name:   string;
  amount: number;
  color:  string;
}

interface Props {
  items:    BarItem[];
  total:    number;
  currency: string;
  legend:   string;
}

export default function StatsBar({ items, total, currency, legend }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; label: string; amount: number; color: string } | null>(null);
  const [popover, setPopover] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popover) return;
    function handler(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopover(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  if (items.length === 0) return <div className="h-2.5 rounded-full bg-gray-100 mb-6" />;

  return (
    <div className="relative mb-6">
      <div
        ref={barRef}
        onClick={() => setPopover(true)}
        className="h-2.5 rounded-full overflow-hidden flex cursor-pointer"
        title={`Ver leyenda de ${legend}`}
      >
        {items.map((item) => {
          const pct = total > 0 ? (item.amount / total) * 100 : 0;
          return (
            <div
              key={item.id}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              className="transition-opacity"
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => {
                const rect = barRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({ x: e.clientX - rect.left, label: item.name, amount: item.amount, color: item.color });
              }}
            />
          );
        })}
      </div>

      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none -top-9 transform -translate-x-1/2 px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 bg-white text-xs flex items-center gap-2 whitespace-nowrap"
          style={{ left: tooltip.x }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltip.color }} />
          <span className="font-semibold text-gray-700">{tooltip.label}</span>
          <span className="text-gray-400">{currency}{fmt(tooltip.amount)}</span>
        </div>
      )}

      {popover && (
        <div
          ref={popRef}
          className="absolute z-20 top-5 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-56"
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Distribución por {legend}
          </p>
          <div className="space-y-2.5">
            {items.map((item) => {
              const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
              return (
                <div key={item.id} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{pct}%</span>
                  <span className="text-xs text-gray-400">{currency}{fmt(item.amount)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Total</span>
            <span className="font-semibold text-gray-600">{currency}{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}