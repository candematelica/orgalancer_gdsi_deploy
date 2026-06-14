"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import NewClientModal from "@/app/(dashboard)/_components/new_client_modal";
import TimeByProjectChart from "./_components/TimeByProjectChart";
import { getCurrency } from "@/app/_hooks/get_currency";

type Client = {
  id: string;
  name: string;
  email: string;
  client_type: string;
  phone_number: string;
  address: string;
  website: string;
  extra_info: string;
};

type Receipt = {
  id: string;
  concept: string;
  amount: number;
  date_emitted: string;
  status: string;
  client_id: string | null;
  project_name: string | null;
};

type ReminderStatus = "idle" | "loading" | "sent" | "error";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<"none" | "confirm" | "warning">("none");
  const [deleting, setDeleting] = useState(false);

  const [pendingReceipts, setPendingReceipts] = useState<Receipt[]>([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>("");
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>("idle");
  const [reminderError, setReminderError] = useState<string>("");
  const [activeProjectCount, setActiveProjectCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const currencySymbol = getCurrency();

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (res.ok) setClient(data);

    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const fetchPendingReceipts = useCallback(async () => {
    try {
      const res = await fetch(`/api/receipts?client_id=${params.id}`);
      if (res.ok) {
        const data: Receipt[] = await res.json();
        const pending = data.filter((r) => r.status === "pending");
        setPendingReceipts(pending);
        if (pending.length > 0) setSelectedReceiptId(pending[0].id);
      }
    } catch { }
  }, [params.id]);

  const fetchClientStats = useCallback(async () => {
    try {
      const [projRes, revRes] = await Promise.all([
        fetch(`/api/projects?client_id=${params.id}&state=active`),
        fetch(`/api/revenue?client_id=${params.id}`),
      ]);
      if (projRes.ok) {
        const projects = await projRes.json();
        setActiveProjectCount(Array.isArray(projects) ? projects.length : 0);
      }
      if (revRes.ok) {
        const revenues = await revRes.json();
        setTotalRevenue(
          Array.isArray(revenues)
            ? revenues.reduce((sum: number, r: { amount: number }) => sum + Number(r.amount), 0)
            : 0
        );
      }
    } catch { }
  }, [params.id]);

  useEffect(() => {
    fetchClient();
    fetchPendingReceipts();
    fetchClientStats();
  }, [fetchClient, fetchPendingReceipts, fetchClientStats]);

  const handleSendReminder = async () => {
    if (!selectedReceiptId || reminderStatus === "loading") return;
    setReminderStatus("loading");
    setReminderError("");

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: params.id,
          invoice_id: selectedReceiptId,
        }),
      });

      if (res.ok) {
        setReminderStatus("sent");
      } else {
        const data = await res.json();
        setReminderError(data.error || "Error al enviar el recordatorio");
        setReminderStatus("error");
      }
    } catch {
      setReminderError("Error de conexión");
      setReminderStatus("error");
    }
  };

  const handleDeleteClick = async () => {
    try {
      const res = await fetch(`/api/projects?client_id=${params.id}&state=active`);
      const data = await res.json();
      const hasActiveProjects = Array.isArray(data) && data.length > 0;
      setDeleteModal(hasActiveProjects ? "warning" : "confirm");
    } catch {
      setDeleteModal("confirm");
    }
  };

  const handleDeleteConfirm = async (action: "cancel" | "complete") => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${params.id}?action=${action}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/clients");
      }
    } catch (error) {
      console.error("Error eliminando cliente", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">Cargando cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">Cliente no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-violet-600 transition-colors"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-violet-700">{client.name}</h1>
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
          >
            Editar
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{client.client_type}</p>
      </div>

      {/* Grid de cards */}
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
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-800">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
              <p className="text-sm text-gray-800">{client.phone_number || "—"}</p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-pink-500">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-pink-500">Ubicación</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Dirección</p>
              <p className="text-sm text-gray-800">{client.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sitio web</p>
              <p className="text-sm text-gray-800">{client.website || "—"}</p>
            </div>
          </div>
        </div>

        {/* Proyectos activos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-500">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-blue-500">Proyectos activos</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeProjectCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            {activeProjectCount === 0
              ? "Sin proyectos por ahora"
              : activeProjectCount === 1
                ? "Proyecto activo"
                : "Proyectos activos"}
          </p>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-green-500">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-green-500">Ingresos totales</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {currencySymbol}{totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalRevenue === 0 ? "Se calculará con los proyectos" : "Acumulado total"}
          </p>
        </div>

        {/* Gráfico de tiempo por proyecto */}
        <div className="col-span-2">
          <TimeByProjectChart clientId={params.id as string} />
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
            <p className="text-sm text-gray-400">
              No hay facturas pendientes para este cliente.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <label
                  htmlFor="receipt-select"
                  className="block text-xs text-gray-500 mb-1.5 font-medium"
                >
                  Factura pendiente
                </label>
                <select
                  id="receipt-select"
                  value={selectedReceiptId}
                  onChange={(e) => {
                    setSelectedReceiptId(e.target.value);
                    setReminderStatus("idle");
                    setReminderError("");
                  }}
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
                  id="send-reminder-btn"
                  onClick={handleSendReminder}
                  disabled={reminderStatus === "loading" || reminderStatus === "sent"}
                  className={`
                    px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-sm
                    ${reminderStatus === "sent"
                      ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                      : reminderStatus === "loading"
                        ? "bg-violet-100 text-violet-500 border border-violet-200 cursor-wait"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-md active:scale-[0.98]"
                    }
                    disabled:opacity-80
                  `}
                >
                  {reminderStatus === "loading" && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {reminderStatus === "idle" && "Enviar recordatorio"}
                  {reminderStatus === "loading" && "Enviando..."}
                  {reminderStatus === "sent" && "✓ Recordatorio enviado"}
                  {reminderStatus === "error" && "Reintentar envío"}
                </button>

                {reminderStatus === "error" && (
                  <p className="text-xs text-red-500">{reminderError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notas internas */}
        {client.extra_info && (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-yellow-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-yellow-600">Notas internas</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{client.extra_info}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editModalOpen && client && (
        <NewClientModal
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchClient();
          }}
          clientToEdit={client}
        />
      )}

      {deleteModal === "confirm" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar cliente?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Estás por eliminar a{" "}
              <span className="font-semibold text-gray-700">{client.name}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal("none")}
                disabled={deleting}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteConfirm("cancel")}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal === "warning" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Este cliente tiene proyectos activos</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Para eliminar a{" "}
              <span className="font-semibold text-gray-700">{client.name}</span>{" "}
              tenés que decidir qué hacer con sus proyectos activos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDeleteConfirm("cancel")}
                disabled={deleting}
                className="w-full px-5 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 text-left"
              >
                <span className="block font-bold">Cancelar proyectos y eliminar cliente</span>
                <span className="block text-xs text-red-100 mt-0.5">Los proyectos activos pasarán a estado &quot;cancelado&quot;</span>
              </button>
              <button
                onClick={() => handleDeleteConfirm("complete")}
                disabled={deleting}
                className="w-full px-5 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 text-left"
              >
                <span className="block font-bold">Finalizar proyectos y eliminar cliente</span>
                <span className="block text-xs text-green-100 mt-0.5">Los proyectos activos pasarán a estado &quot;finalizado&quot;</span>
              </button>
              <button
                onClick={() => setDeleteModal("none")}
                disabled={deleting}
                className="w-full px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar operación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}