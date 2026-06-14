"use client";

import { useClientReceipts } from "../_hooks/use_client_receipts";

const RECEIPT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  paid:    { label: "Cobrado",   color: "bg-green-100 text-green-700" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReceiptsTab({ clientId }: { clientId: string }) {
  const { receipts, loading } = useClientReceipts(clientId);

  if (loading) return <div className="animate-pulse h-32 bg-gray-50 rounded-2xl" />;

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">Este cliente no tiene recibos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Concepto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Proyecto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Fecha</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Monto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r, i) => {
            const statusInfo = RECEIPT_STATUS[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-600" };
            return (
              <tr key={r.id} className={`hover:bg-violet-50/30 transition-colors ${i < receipts.length - 1 ? "border-b border-gray-50" : ""}`}>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">{r.concept}</p>
                  <p className="text-xs text-gray-400">#{r.id.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{r.project_name ?? "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(r.date_emitted)}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                  ${r.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}