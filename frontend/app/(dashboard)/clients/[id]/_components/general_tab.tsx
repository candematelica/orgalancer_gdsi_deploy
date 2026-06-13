"use client";

import TimeByProjectChart from "./TimeByProjectChart";
import { usePendingReceipts } from "../_hooks/use_pending_receipts";
import { useReminder } from "../_hooks/use_reminder";

interface Client {
  email: string;
  phone_number: string;
  address: string;
  website: string;
  extra_info: string;
}

export default function GeneralTab({ client, clientId }: { client: Client; clientId: string }) {
  const { pendingReceipts, selectedReceiptId, setSelectedReceiptId } = usePendingReceipts(clientId);
  const { status, error, sendReminder, reset } = useReminder(clientId);

  const handleSelectReceipt = (id: string) => {
    setSelectedReceiptId(id);
    reset();
  };

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Contacto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-600">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-violet-600">Contacto</h2>
        </div>
        <div className="space-y-3">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs w-20 shrink-0">Email</span>
              <span>{client.email}</span>
            </div>
          )}
          {client.phone_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs w-20 shrink-0">Teléfono</span>
              <span>{client.phone_number}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs w-20 shrink-0">Dirección</span>
              <span>{client.address}</span>
            </div>
          )}
          {client.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs w-20 shrink-0">Web</span>
              <a href={client.website} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline truncate">
                {client.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Notas internas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-yellow-500">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-yellow-600">Notas internas</h2>
        </div>
        {client.extra_info ? (
          <p className="text-sm text-gray-700 leading-relaxed">{client.extra_info}</p>
        ) : (
          <p className="text-sm text-gray-400">Sin notas para este cliente.</p>
        )}
      </div>

      {/* Gráfico de tiempo */}
      <div className="col-span-2">
        <TimeByProjectChart clientId={clientId} />
      </div>

      {/* Recordatorio de pago */}
      <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-amber-500">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-amber-600">Recordatorio de pago</h2>
        </div>
        {pendingReceipts.length === 0 ? (
          <p className="text-sm text-gray-400">No hay facturas pendientes para este cliente.</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label htmlFor="receipt-select" className="block text-xs text-gray-500 mb-1.5 font-medium">
                Factura pendiente
              </label>
              <select
                id="receipt-select"
                value={selectedReceiptId}
                onChange={(e) => handleSelectReceipt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              >
                {pendingReceipts.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.id.slice(0, 8).toUpperCase()} — {r.concept} — ${r.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <button
                onClick={() => sendReminder(selectedReceiptId)}
                disabled={status === "loading" || status === "sent"}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm disabled:opacity-80 ${
                  status === "sent"
                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                    : status === "loading"
                    ? "bg-violet-100 text-violet-500 border border-violet-200 cursor-wait"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {status === "loading" && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {status === "idle"    && "Enviar recordatorio"}
                {status === "loading" && "Enviando..."}
                {status === "sent"    && "✓ Recordatorio enviado"}
                {status === "error"   && "Reintentar envío"}
              </button>
              {status === "error" && <p className="text-xs text-red-500">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}