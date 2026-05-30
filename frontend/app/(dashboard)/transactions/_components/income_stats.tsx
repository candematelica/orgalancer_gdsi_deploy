"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Transaction } from "./income_list";

interface Props {
  transactions: Transaction[];
  currency:     string;
}

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const METHOD_COLORS: Record<string, string> = {
  "Transferencia": "#3B82F6",
  "Efectivo":      "#22C55E",
  "Tarjeta":       "#8B5CF6",
  "PayPal":        "#F97316",
  "Canje":         "#EC4899",
  "Otro":          "#94A3B8",
};

function fmt(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function MethodBar({
  breakdown, total, currency,
}: {
  breakdown: { method: string; amount: number; color: string }[];
  total: number;
  currency: string;
}) {
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

  if (breakdown.length === 0) return <div className="h-2.5 rounded-full bg-gray-100 mb-6" />;

  return (
    <div className="relative mb-6">
      <div
        ref={barRef}
        onClick={() => setPopover(true)}
        className="h-2.5 rounded-full overflow-hidden flex cursor-pointer"
        title="Ver leyenda de métodos de pago"
      >
        {breakdown.map((item) => {
          const pct = total > 0 ? (item.amount / total) * 100 : 0;
          return (
            <div
              key={item.method}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              onMouseEnter={() => {}}
              onMouseLeave={() => setTooltip(null)}
              onMouseMove={(e) => {
                const rect = barRef.current?.getBoundingClientRect();
                if (!rect) return;
                setTooltip({ x: e.clientX - rect.left, label: item.method, amount: item.amount, color: item.color });
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
            Distribución por método
          </p>
          <div className="space-y-2.5">
            {breakdown.map((item) => {
              const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
              return (
                <div key={item.method} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700 flex-1">{item.method}</span>
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


export default function RevenueStatCards({ transactions, currency }: Props) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const isCurrent = year === now.getFullYear() && month === now.getMonth();

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (isCurrent) return;
    if (month === 11) { setMonth(0);  setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monetary = filtered.filter(t => t.payment_type === "monetario").reduce((s, t) => s + t.amount, 0);
  const barter   = filtered.filter(t => t.payment_type === "canje").reduce((s, t) => s + t.amount, 0);
  const total    = monetary + barter;

  const monetaryPct = total > 0 ? Math.round((monetary / total) * 100) : 0;
  const barterPct   = total > 0 ? Math.round((barter   / total) * 100) : 0;

  const methodMap = new Map<string, number>();
  filtered.forEach((t) => {
    const m = t.payment_type === "canje" ? "Canje" : (t.payment_method ?? "Otro");
    methodMap.set(m, (methodMap.get(m) ?? 0) + t.amount);
  });
  const breakdown = Array.from(methodMap.entries())
    .map(([method, amount]) => ({ method, amount, color: METHOD_COLORS[method] ?? METHOD_COLORS["Otro"] }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-4 mb-3">

        {/* Card 1 — Month selector */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-gray-400">Período</p>
          <div className="flex items-center gap-4">
            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <ChevronLeft size={18} />
            </button>
            <p className="text-3xl font-bold text-green-600 text-center w-52">
              {MONTH_NAMES[month]}<br />
              <span className="text-lg font-semibold text-gray-400">{year}</span>
            </p>
            <button
              onClick={next}
              disabled={isCurrent}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {!isCurrent ? (
            <button onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }} className="text-xs text-green-600 hover:underline">
              Volver al mes actual
            </button>
          ) : (
            <p className="text-xs text-gray-300">Mes actual</p>
          )}
        </div>

        {/* Card 2 — Total */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="13" rx="2" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12.5" r="2.5" stroke="white" strokeWidth="1.5" />
                <path d="M6 12.5h.01M18 12.5h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
          <p className="text-2xl font-bold text-purple-600">{currency}{fmt(total)}</p>
          <p className="text-xs text-gray-400 mt-1">Monetario + Canje</p>
        </div>

        {/* Card 3 — Monetary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M3 17l4-4 4 4 4-5 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
              {monetaryPct}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Pagos Monetarios</p>
          <p className="text-2xl font-bold text-purple-600">{currency}{fmt(monetary)}</p>
          <p className="text-xs text-gray-400 mt-1">Efectivo y transferencias</p>
        </div>

        {/* Card 4 — Barter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M3 17l4-4 4 4 4-5 4-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
              {barterPct}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Valuación de Canjes</p>
          <p className="text-2xl font-bold text-purple-600">{currency}{fmt(barter)}</p>
          <p className="text-xs text-gray-400 mt-1">Bienes y servicios</p>
        </div>

      </div>

      {/* Payment method bar */}
      <MethodBar breakdown={breakdown} total={total} currency={currency} />
    </div>
  );
}