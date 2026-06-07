"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  from: string;
  to: string;
}

interface Metrics {
  hours: number;
  revenue: number;
  expenses: number;
  netProfit: number;
  activeProjects: number;
}

function getPreviousRange(from: string, to: string): { from: string; to: string } {
  const f = new Date(from);
  const t = new Date(to);
  const diffMs = t.getTime() - f.getTime();
  const prevTo = new Date(f.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diffMs);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { from: fmt(prevFrom), to: fmt(prevTo) };
}

function calcVariation(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

async function fetchMetrics(from: string, to: string): Promise<Metrics> {
  const [revenueRes, expensesRes, timeRes, projectsRes] = await Promise.all([
    fetch(`/api/revenue?from=${from}&to=${to}`),
    fetch(`/api/expenses?from=${from}&to=${to}`),
    fetch(`/api/time-entries?from=${from}&to=${to}`),
    fetch(`/api/projects?state=active`),
  ]);

  const [revenueData, expensesData, timeData, projectsData] = await Promise.all([
    revenueRes.ok ? revenueRes.json() : [],
    expensesRes.ok ? expensesRes.json() : [],
    timeRes.ok ? timeRes.json() : [],
    projectsRes.ok ? projectsRes.json() : [],
  ]);

  const revenue = (revenueData as any[]).reduce((s: number, r: any) => s + r.amount, 0);
  const expenses = (expensesData as any[]).reduce((s: number, e: any) => s + e.amount, 0);
  const minutes = (timeData as any[]).reduce((s: number, t: any) => s + t.duration_minutes, 0);

  return {
    hours: Math.round((minutes / 60) * 10) / 10,
    revenue: Math.round(revenue * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    netProfit: Math.round((revenue - expenses) * 100) / 100,
    activeProjects: Array.isArray(projectsData) ? projectsData.length : 0,
  };
}

interface MetricCardProps {
  label: string;
  value: string;
  variation: number | null;
  prefix?: string;
}

function MetricCard({ label, value, variation, prefix = "" }: MetricCardProps) {
  const isPositive = variation !== null && variation > 0;
  const isNegative = variation !== null && variation < 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mb-2">{prefix}{value}</p>
      <div className="flex items-center gap-1">
        {variation === null ? (
          <>
            <Minus className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Sin datos anteriores</span>
          </>
        ) : variation === 0 ? (
          <>
            <Minus className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Sin cambios</span>
          </>
        ) : isPositive ? (
          <>
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs text-green-600 font-medium">+{variation}% vs período anterior</span>
          </>
        ) : (
          <>
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs text-red-600 font-medium">{variation}% vs período anterior</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardMetrics({ from, to }: Props) {
  const [current, setCurrent] = useState<Metrics | null>(null);
  const [previous, setPrevious] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prev = getPreviousRange(from, to);
        const [cur, pre] = await Promise.all([
          fetchMetrics(from, to),
          fetchMetrics(prev.from, prev.to),
        ]);
        setCurrent(cur);
        setPrevious(pre);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [from, to]);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
            <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
            <div className="h-7 w-16 bg-gray-100 rounded mb-3" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!current || !previous) return null;

  const currency = "$";

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <MetricCard
        label="Horas trabajadas"
        value={`${current.hours}h`}
        variation={calcVariation(current.hours, previous.hours)}
      />
      <MetricCard
        label="Ingresos"
        value={current.revenue.toLocaleString("es-AR")}
        variation={calcVariation(current.revenue, previous.revenue)}
        prefix={currency}
      />
      <MetricCard
        label="Gastos"
        value={current.expenses.toLocaleString("es-AR")}
        variation={calcVariation(current.expenses, previous.expenses)}
        prefix={currency}
      />
      <MetricCard
        label="Ganancia neta"
        value={current.netProfit.toLocaleString("es-AR")}
        variation={calcVariation(current.netProfit, previous.netProfit)}
        prefix={currency}
      />
      <MetricCard
        label="Proyectos activos"
        value={String(current.activeProjects)}
        variation={calcVariation(current.activeProjects, previous.activeProjects)}
      />
    </div>
  );
}