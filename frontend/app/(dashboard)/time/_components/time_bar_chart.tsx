"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { BarChart2 } from "lucide-react";
import type { PeriodBucket, PeriodView } from "../_hooks/use_time_entries";

interface Props {
  buckets:        PeriodBucket[];
  periodView:     PeriodView;
  onChangePeriod: (v: PeriodView) => void;
  periodLabel:    string;
  loading:        boolean;
}

const VIEWS: { value: PeriodView; label: string }[] = [
  { value: "daily",   label: "Diario"   },
  { value: "weekly",  label: "Semanal"  },
  { value: "monthly", label: "Mensual"  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const h = payload[0].value as number;
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className={`font-bold ${h === 0 ? "text-gray-400" : "text-violet-600"}`}>
        {h === 0 ? "Sin registros" : `${hh > 0 ? `${hh}h ` : ""}${mm > 0 ? `${mm}m` : ""}`}
      </p>
    </div>
  );
};

export default function TimeBarChart({ buckets, periodView, onChangePeriod, periodLabel, loading }: Props) {
  const maxHours = Math.max(...buckets.map((b) => b.hours), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 size={15} className="text-violet-400" />
            Horas registradas
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {VIEWS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChangePeriod(opt.value)}
              className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                periodView === opt.value ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {buckets.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
              dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 10, textAnchor: "end" }}
                angle={periodView === "weekly" ? -40 : 0}
                dy={periodView === "weekly" ? 10 : 8}
                dx={periodView === "weekly" ? -5 : 0}
                height={periodView === "weekly" ? 60 : 30}  
                interval={
                  periodView === "daily"   ? Math.max(0, Math.floor(buckets.length / 8)) :
                  periodView === "weekly"  ? Math.max(0, Math.floor(buckets.length / 10)) :
                  0
                }
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                dx={-4}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f3ff" }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48} minPointSize={2}>
                {buckets.map((b, i) => (
                  <Cell
                    key={i}
                    fill={b.hours === 0 ? "#e9d5ff" : b.hours === maxHours ? "#7c3aed" : "#a78bfa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <BarChart2 size={44} className="mb-3 opacity-40" />
            <p className="text-sm text-gray-400">Sin datos para el período</p>
          </div>
        )}
      </div>
    </div>
  );
}