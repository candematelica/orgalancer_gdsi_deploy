"use client";

import { useState } from "react";
import { type Transaction } from "./income_list";
import StatsMonthSelector from "./stats_month_selector";
import StatsBar, { type BarItem } from "./stats_bar";
import { fmt } from "../_utils/fmt";

interface Props {
  transactions: Transaction[];
  currency:     string;
}

const METHOD_COLORS: Record<string, string> = {
  "Transferencia": "#3B82F6",
  "Efectivo":      "#22C55E",
  "Tarjeta":       "#8B5CF6",
  "PayPal":        "#F97316",
  "Canje":         "#EC4899",
  "Otro":          "#94A3B8",
};

export default function RevenueStatCards({ transactions, currency }: Props) {
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

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monetary    = filtered.filter((t) => t.payment_type === "monetario").reduce((s, t) => s + t.amount, 0);
  const barter      = filtered.filter((t) => t.payment_type === "canje").reduce((s, t) => s + t.amount, 0);
  const total       = monetary + barter;
  const monetaryPct = total > 0 ? Math.round((monetary / total) * 100) : 0;
  const barterPct   = total > 0 ? Math.round((barter   / total) * 100) : 0;

  const methodMap = new Map<string, number>();
  filtered.forEach((t) => {
    const m = t.payment_type === "canje" ? "Canje" : (t.payment_method ?? "Otro");
    methodMap.set(m, (methodMap.get(m) ?? 0) + t.amount);
  });
  const barItems: BarItem[] = Array.from(methodMap.entries())
    .map(([method, amount]) => ({
      id:     method,
      name:   method,
      amount,
      color:  METHOD_COLORS[method] ?? METHOD_COLORS["Otro"],
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-5 gap-4 mb-3">

        <StatsMonthSelector
          year={year} month={month} color="text-green-600"
          onPrev={prev} onNext={next}
          onCurrent={() => { setMonth(now.getMonth()); setYear(now.getFullYear()); }}
        />

        {/* Total */}
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

        {/* Monetary */}
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

        {/* Barter */}
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

      <StatsBar items={barItems} total={total} currency={currency} legend="método" />
    </div>
  );
}