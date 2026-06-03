"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueEntry {
  date: string;
  amount: number;
  currency: string;
}

interface MonthData {
  month: string;
  real: number;
  proyeccion: number;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function RevenueLineChart() {
  const [data, setData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const now = new Date();
        const from = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
        const fromStr = from.toISOString().split("T")[0];
        const toStr = now.toISOString().split("T")[0];

        const res = await fetch(`/api/revenue?from=${fromStr}&to=${toStr}`);
        if (!res.ok) return;

        const entries: RevenueEntry[] = await res.json();
        if (entries.length > 0) setCurrency(entries[0].currency);

        const monthMap: Record<string, number> = {};
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthMap[key] = 0;
        }

        for (const entry of entries) {
          const key = entry.date.slice(0, 7);
          if (key in monthMap) {
            monthMap[key] += entry.amount;
          }
        }

        const values = Object.values(monthMap).filter((v) => v > 0);
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const proyeccion = Math.round(avg * 100) / 100;

        const result: MonthData[] = Object.entries(monthMap).map(([key, total]) => {
          const [year, month] = key.split("-");
          return {
            month: `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`,
            real: Math.round(total * 100) / 100,
            proyeccion,
          };
        });

        setData(result);
      } catch (err) {
        console.error("Error fetching revenue line chart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-100 rounded mb-6" />
        <div className="h-48 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  const symbol = currency === "USD" ? "$" : currency;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-800 mb-6">
        Ingresos reales vs proyección estimada
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${symbol}${v}`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${symbol}${value}`,
              name === "real" ? "Ingresos reales" : "Proyección",
            ]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {value === "real" ? "Ingresos reales" : "Proyección estimada"}
              </span>
            )}
          />
          <Line type="monotone" dataKey="real" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="proyeccion" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}