"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingDown, Tag, Star } from "lucide-react";
import { type Expense, type ExpenseCategory } from "../_hooks/use_expenses";

interface Props {
  expenses:   Expense[];
  categories: ExpenseCategory[];
  currency:   string;
}

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const FALLBACK_COLOR = "#8B5CF6";

function fmt(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}


function StatCard({
  icon, iconBg, label, value, valueColor, sub, badge, wide = false,
}: {
  icon: React.ReactNode; iconBg: string; label: string;
  value: React.ReactNode; valueColor: string; sub?: string;
  badge?: string; wide?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {badge && (
          <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}


function CategoryBar({
  breakdown, total, currency,
}: {
  breakdown: (ExpenseCategory & { total: number })[]; total: number; currency: string;
}) {
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [tooltip,  setTooltip]  = useState<{ x: number; label: string; amount: number; color: string } | null>(null);
  const [popover,  setPopover]  = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // close popover on outside click
  useEffect(() => {
    if (!popover) return;
    function handler(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPopover(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  if (breakdown.length === 0) return (
    <div className="h-2.5 rounded-full bg-gray-100 mb-6" />
  );

  function handleMouseMove(e: React.MouseEvent, cat: ExpenseCategory & { total: number }) {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x:      e.clientX - rect.left,
      label:  cat.name,
      amount: cat.total,
      color:  cat.color ?? FALLBACK_COLOR,
    });
  }

  return (
    <div className="relative mb-6">
      {/* Bar */}
      <div
        ref={barRef}
        onClick={() => setPopover(true)}
        className="h-2.5 rounded-full overflow-hidden flex cursor-pointer"
        title="Ver leyenda de categorías"
      >
        {breakdown.map((cat) => {
          const pct   = total > 0 ? (cat.total / total) * 100 : 0;
          const color = cat.color ?? FALLBACK_COLOR;
          return (
            <div
              key={cat.id}
              style={{ width: `${pct}%`, backgroundColor: color }}
              className="transition-opacity"
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              onMouseMove={(e) => handleMouseMove(e, cat)}
            />
          );
        })}
      </div>

      {/* Hover tooltip */}
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

      {/* Popover */}
      {popover && (
        <div
          ref={popRef}
          className="absolute z-20 top-5 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-56"
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Distribución por categoría
          </p>
          <div className="space-y-2.5">
            {breakdown.map((cat) => {
              const pct   = total > 0 ? Math.round((cat.total / total) * 100) : 0;
              const color = cat.color ?? FALLBACK_COLOR;
              return (
                <div key={cat.id} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700 flex-1 truncate">{cat.name}</span>
                  <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
                  <span className="text-xs text-gray-400">{currency}{fmt(cat.total)}</span>
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

// main component
export default function ExpenseStatCards({ expenses, categories, currency }: Props) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  const isCurrent = year === now.getFullYear() && month === now.getMonth();

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const uncategorizedTotal = filtered
    .filter((e) => !e.category_id)
    .reduce((s, e) => s + e.amount, 0);

  const breakdown = [
    ...categories
      .map((cat) => ({
        ...cat,
        total: filtered.filter((e) => e.category_id === cat.id).reduce((s, e) => s + e.amount, 0),
      }))
      .filter((c) => c.total > 0),
    ...(uncategorizedTotal > 0
      ? [{ id: "__uncategorized__", name: "Sin categoría", color: "#9CA3AF", total: uncategorizedTotal }]
      : []),
  ].sort((a, b) => b.total - a.total);

  const topCat = breakdown[0] ?? null;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-4 mb-3">

        {/* Card 1 — Month selector (2 cols) */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-gray-400">Período</p>
          <div className="flex items-center gap-4">
            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <ChevronLeft size={18} />
            </button>
            <p className="text-3xl font-bold text-violet-600 text-center w-52">
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
            <button
              onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
              className="text-xs text-green-600 hover:underline"
            >
              Volver al mes actual
            </button>
          ) : (
            <p className="text-xs text-gray-300">Mes actual</p>
          )}
        </div>

        {/* Card 2 - Total expenses */}
        <StatCard
          iconBg="bg-red-500"
          icon={<TrendingDown size={18} stroke="white" />}
          label="Gastos del mes"
          value={`${currency}${fmt(total)}`}
          valueColor="text-red-500"
          sub={`${filtered.length} registros`}
        />

        {/* Card 3 - Active categories */}
        <StatCard
          iconBg="bg-orange-400"
          icon={<Tag size={18} stroke="white" />}
          label="Categorías activas"
          value={breakdown.length}
          valueColor="text-orange-500"
          sub={`de ${categories.length} en total`}
        />

        {/* Card 4 - Top category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: topCat?.color ?? "#8B5CF6" }}
            >
              <Star size={18} stroke="white" />
            </div>
            {topCat && total > 0 && (
              <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                {Math.round((topCat.total / total) * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">Mayor gasto</p>
          <p
            className="text-2xl font-bold truncate"
            style={{ color: topCat?.color ?? "#8B5CF6" }}
          >
            {topCat?.name ?? "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {topCat ? `${currency}${fmt(topCat.total)}` : "Sin datos este mes"}
          </p>
        </div>
      </div>

      {/* Category color bar */}
      <CategoryBar breakdown={breakdown} total={total} currency={currency} />
    </div>
  );
}