"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Clock, DollarSign, Receipt } from "lucide-react";

interface ProfitabilityData {
  project_id:     string;
  total_income:   number;
  total_hours:    number;
  labor_cost:     number;
  total_expenses: number;
  profitability:  number;
  is_negative:    boolean;
}

function fmt(value: number, currency = "$") {
  return `${currency}${value.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
}

export default function ProfitabilityTab({ projectId, currency = "$" }: { projectId: string; currency?: string }) {
  const [data, setData]       = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/profitability`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError("No se pudo cargar la rentabilidad"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <p className="text-sm text-gray-400 p-4">Cargando...</p>;
  if (error)   return <p className="text-sm text-red-400 p-4">{error}</p>;
  if (!data)   return null;

  const isPositive = !data.is_negative;

  return (
    <div className="p-4 space-y-4">
      {/* Cards resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ingresos totales",  value: fmt(data.total_income, currency),   color: "text-green-600"  },
          { label: "Costo de horas",    value: fmt(data.labor_cost, currency),      color: "text-red-500"    },
          { label: "Gastos asociados",  value: fmt(data.total_expenses, currency),  color: "text-red-500"    },
          { label: "Rentabilidad neta", value: fmt(data.profitability, currency),   color: isPositive ? "text-green-600" : "text-red-500" },
        ].map(card => (
          <div key={card.label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-lg font-semibold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Desglose */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Desglose</p>
        {[
          { icon: DollarSign, label: "Ingresos registrados",                              amount: data.total_income,   neg: false },
          { icon: Clock,      label: `Costo de horas (${data.total_hours}h × tarifa)`,    amount: data.labor_cost,     neg: true  },
          { icon: Receipt,    label: "Gastos asociados",                                  amount: data.total_expenses, neg: true  },
        ].map(({ icon: Icon, label, amount, neg }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
            <span className="flex items-center gap-2 text-gray-500">
              <Icon className="w-4 h-4" /> {label}
            </span>
            <span className={`font-medium ${neg ? "text-red-500" : "text-gray-900"}`}>
              {neg ? "−" : ""}{fmt(amount, currency)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 text-sm font-semibold">
          <span className="text-gray-700">Rentabilidad neta</span>
          <span className={isPositive ? "text-green-600" : "text-red-500"}>
            {fmt(data.profitability, currency)}
          </span>
        </div>
      </div>

      {/* Alerta */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        isPositive
          ? "bg-green-50 text-green-700 border border-green-100"
          : "bg-red-50 text-red-600 border border-red-100"
      }`}>
        {isPositive
          ? <><TrendingUp className="w-4 h-4" /> Este proyecto es rentable.</>
          : <><TrendingDown className="w-4 h-4" /> La rentabilidad de este proyecto es negativa.</>
        }
      </div>
    </div>
  );
}