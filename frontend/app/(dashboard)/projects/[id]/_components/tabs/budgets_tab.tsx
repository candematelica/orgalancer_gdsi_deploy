"use client";

import { useState, useEffect, useCallback } from "react";

interface Budget {
  id:           string;
  name:         string;
  total_amount: number;
  currency:     string;
  description:  string | null;
  status:       string;
  client_name:  string | null;
  created_at:   string;
}

const STATUS_LABEL: Record<string, string> = {
  pending:  "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const CURRENCIES = ["USD", "EUR", "ARS", "GBP", "MXN", "BRL"];

interface Props { projectId: string }

export default function BudgetsTab({ projectId }: Props) {
  const [budgets, setBudgets]     = useState<Budget[]>([]);
  const [loading, setLoading]     = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [sendingId, setSendingId]   = useState<string | null>(null);
  const [sentIds, setSentIds]       = useState<Set<string>>(new Set());
  const [toast, setToast]           = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?project_id=${projectId}`);
      if (res.ok) setBudgets(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/budgets/${id}/send`, { method: "POST" });
      if (res.ok) {
        setSentIds(prev => new Set([...prev, id]));
        showToast("Presupuesto enviado al cliente");
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "Error al enviar");
      }
    } finally {
      setSendingId(null);
    }
  };

  const fmt = (amount: number, currency: string) => {
    const sym: Record<string, string> = { USD: "$", EUR: "€", ARS: "$", GBP: "£", MXN: "$", BRL: "R$" };
    return `${sym[currency] ?? currency}${amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Presupuestos</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "Cargando..." : `${budgets.length} presupuesto${budgets.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusIcon /> Nuevo Presupuesto
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      )}

      {!loading && budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
            <FileIcon className="text-violet-400" />
          </div>
          <p className="text-sm text-gray-400 text-center">Todavía no hay presupuestos para este proyecto.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Crear el primer presupuesto
          </button>
        </div>
      )}

      {!loading && budgets.length > 0 && (
        <div className="space-y-3">
          {budgets.map(b => (
            <div key={b.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
                {b.description && (
                  <p className="text-xs text-gray-500 truncate">{b.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(b.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  {b.client_name && ` · ${b.client_name}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base font-bold text-violet-700">{fmt(b.total_amount, b.currency)}</span>
                {b.client_name && (
                  <button
                    onClick={() => handleSend(b.id)}
                    disabled={!!sendingId || sentIds.has(b.id)}
                    className="px-3 py-1.5 rounded-xl border border-violet-200 text-violet-600 text-xs font-semibold hover:bg-violet-50 disabled:opacity-50 transition-colors"
                  >
                    {sentIds.has(b.id) ? "Enviado" : sendingId === b.id ? "..." : "Enviar"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateBudgetModal
          projectId={projectId}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); load(); showToast("Presupuesto creado"); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-6 py-3 rounded-xl shadow-lg font-medium text-white bg-gray-900">{toast}</div>
        </div>
      )}
    </>
  );
}

function CreateBudgetModal({ projectId, onClose, onCreated }: {
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm]     = useState({ name: "", total_amount: "", currency: "USD", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.total_amount);
    if (!form.name.trim() || !amount) { setError("Nombre y monto son obligatorios."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, total_amount: amount, currency: form.currency, description: form.description || null, project_id: projectId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al guardar"); return; }
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Nuevo Presupuesto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Desarrollo web"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_amount}
                onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Detalles del presupuesto..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
