"use client";

import { useEffect, useState } from "react";

interface Receipt {
  id: string;
  client_name: string | null;
  concept: string;
  amount: number;
  date_emitted: string | null;
  status: string;
}

interface ReminderItem {
  id: string;
  client: string;
  detail: string;
  amount: string;
  isOverdue: boolean;
  daysLate: number;
}

function buildDetail(dateStr: string | null): { detail: string; isOverdue: boolean; daysLate: number } {
  if (!dateStr) return { detail: "Fecha no especificada", isOverdue: false, daysLate: 0 };

  const emitted = new Date(dateStr);
  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  emitted.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - emitted.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return { detail: "Emitido hoy", isOverdue: false, daysLate: 0 };
  if (diff > 0)  return { detail: `${diff} día${diff !== 1 ? "s" : ""} de retraso`, isOverdue: true, daysLate: diff };
  return { detail: `Vence en ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`, isOverdue: false, daysLate: 0 };
}

export default function PaymentReminders() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await fetch("/api/receipts");
        if (!res.ok) return;
        const all: Receipt[] = await res.json();

        const pending = all
          .filter((r) => r.status === "pending")
          .map((r) => {
            const { detail, isOverdue, daysLate } = buildDetail(r.date_emitted);
            return {
              id: r.id,
              client: r.client_name ?? "Cliente sin nombre",
              detail,
              amount: `$${r.amount.toLocaleString("es-AR")}`,
              isOverdue,
              daysLate,
            };
          })
          .sort((a, b) => b.daysLate - a.daysLate)
          .slice(0, 3);

        setReminders(pending);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 w-44 bg-gray-100 rounded mb-5" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-orange-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-red-500 font-bold text-base mb-4">Recordatorios de Cobro</h2>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-200 mb-3">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-gray-400 text-sm">No hay cobros pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                r.isOverdue
                  ? "bg-orange-50 border-orange-100"
                  : "bg-yellow-50 border-yellow-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
                  className={`shrink-0 ${r.isOverdue ? "text-orange-400" : "text-yellow-400"}`}
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-gray-700 text-sm font-medium">{r.client}</p>
                  <p className={`text-xs ${r.isOverdue ? "text-orange-500 font-medium" : "text-gray-400"}`}>
                    {r.detail}
                  </p>
                </div>
              </div>
              <span className="text-red-500 font-bold text-sm shrink-0 ml-2">{r.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}