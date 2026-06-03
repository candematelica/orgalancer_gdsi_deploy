"use client";

import { useState } from "react";
import { TrendingDown, Tag, Star } from "lucide-react";
import { type Expense, type ExpenseCategory } from "../_hooks/use_expenses";
import StatsMonthSelector from "./stats_month_selector";
import StatsBar, { type BarItem } from "./stats_bar";
import { fmt } from "../_utils/fmt";

interface Props {
  expenses:   Expense[];
  categories: ExpenseCategory[];
  currency:   string;
}

const FALLBACK_COLOR   = "#8B5CF6";
const UNCATEGORIZED_ID = "__uncategorized__";

export default function ExpenseStatCards({ expenses, categories, currency }: Props) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function next() {
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const uncategorizedTotal = filtered
    .filter((e) => !e.category_id)
    .reduce((s, e) => s + e.amount, 0);

  const breakdown: BarItem[] = [
    ...categories
      .map((cat) => ({
        id:     cat.id,
        name:   cat.name,
        amount: filtered.filter((e) => e.category_id === cat.id).reduce((s, e) => s + e.amount, 0),
        color:  cat.color ?? FALLBACK_COLOR,
      }))
      .filter((c) => c.amount > 0),
    ...(uncategorizedTotal > 0
      ? [{ id: UNCATEGORIZED_ID, name: "Sin categoría", color: "#9CA3AF", amount: uncategorizedTotal }]
      : []),
  ].sort((a, b) => b.amount - a.amount);

  const topCat = breakdown[0] ?? null;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-4 mb-3">

        <StatsMonthSelector
          year={year} month={month} color="text-red-500"
          onPrev={prev} onNext={next}
          onCurrent={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
        />

        {/* Total expenses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown size={18} stroke="white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Gastos del mes</p>
          <p className="text-2xl font-bold text-red-500">{currency}{fmt(total)}</p>
          <p className="text-xs text-gray-400 mt-1">{filtered.length} registros</p>
        </div>

        {/* Active categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
              <Tag size={18} stroke="white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Categorías activas</p>
          <p className="text-2xl font-bold text-orange-500">{breakdown.length}</p>
          <p className="text-xs text-gray-400 mt-1">de {categories.length} en total</p>
        </div>

        {/* Top category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: topCat?.color ?? FALLBACK_COLOR }}
            >
              <Star size={18} stroke="white" />
            </div>
            {topCat && total > 0 && (
              <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                {Math.round((topCat.amount / total) * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-1">Mayor gasto</p>
          <p className="text-2xl font-bold truncate" style={{ color: topCat?.color ?? FALLBACK_COLOR }}>
            {topCat?.name ?? "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {topCat ? `${currency}${fmt(topCat.amount)}` : "Sin datos este mes"}
          </p>
        </div>

      </div>

      <StatsBar items={breakdown} total={total} currency={currency} legend="categoría" />
    </div>
  );
}