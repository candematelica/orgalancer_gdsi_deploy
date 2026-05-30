"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { type Transaction } from "./income_list";
import { useReceipts }      from "../../_receipts/_hooks/use_receipts";
import { type Receipt }     from "../../_receipts/types";

interface SelectOption { id: string; name: string; }
interface ProjectOption { id: string; name: string; client_id: string | null; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void;
  currency: string;
  initialData?: Transaction;
  mode?: "create" | "edit";
}

const EMPTY = {
  client_id: "",
  project_id: "",
  receipt_id: "",
  amount: "",
  payment_type: "monetario" as "monetario" | "canje",
  payment_method: "Transferencia",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

function useOptions(apiPath: string, enabled: boolean): SelectOption[] {
  const [options, setOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    if (!enabled) return;
    fetch(apiPath, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setOptions(data.map((d) => ({ id: d.id, name: d.name }))))
      .catch(() => {});
  }, [apiPath, enabled]);
  return options;
}

export default function RegisterIncomeModal({ open, onClose, onSave, currency, initialData, mode = "create" }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const clients  = useOptions("/api/clients",  open);
  
  const [allProjects, setAllProjects] = useState<ProjectOption[]>([]);
  useEffect(() => {
  if (!open) return;
  fetch("/api/projects", { cache: "no-store" })
    .then(r => r.ok ? r.json() : [])
    .then((data: any[]) =>
      setAllProjects(data.map(p => ({ id: p.id, name: p.name, client_id: p.client_id ?? null })))
    )
    .catch(() => {});
  }, [open]);

  const projects = form.client_id
  ? allProjects.filter(p => p.client_id === form.client_id)
  : allProjects;

  const { receipts, load: loadReceipts } = useReceipts();
  const pendingReceipts = receipts.filter((r: Receipt) => r.status === "pending" || r.id === form.receipt_id);

  useEffect(() => {
    if (!open) return;
    if (form.client_id) {
      loadReceipts({ client_id: form.client_id });
    } else if (form.project_id) {
      loadReceipts({ project_id: form.project_id });
    }
  }, [form.project_id, form.client_id, open, loadReceipts]);

  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      setForm({
        client_id:      initialData.client_id      ?? "",
        project_id:     initialData.project_id     ?? "",
        receipt_id:     initialData.receipt_id     ?? "",
        amount:         String(initialData.amount),
        payment_type:   initialData.payment_type   as "monetario" | "canje",
        payment_method: initialData.payment_method,
        date:           initialData.date,
        description:    initialData.description    ?? "",
      });
    } else if (open && mode === "create") {
      setForm(EMPTY);
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleReceiptSelect(receiptId: string) {
    const r = receiptId
      ? pendingReceipts.find((r: Receipt) => r.id === receiptId)
      : null;

    setForm(prev => ({
      ...prev,
      receipt_id: receiptId,
      ...(r               ? { amount:     String(r.amount) } : {}),
      ...(r?.project_id   ? { project_id: r.project_id     } : {}),
    }));
  }

  function handleChange(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.amount) {
      setError("Seleccioná un cliente e ingresá el monto.");
      return;
    }

    const client = clients.find((c) => c.id === form.client_id);
    const project = projects.find((p) => p.id === form.project_id);

    onSave({
      client_id:      form.client_id,
      project_id:     form.project_id     || null,
      receipt_id:     form.receipt_id     || null,
      client_name:    client?.name        ?? "",
      project_name:   project?.name       ?? "Sin proyecto",
      amount:         parseFloat(form.amount),
      currency,
      payment_type:   form.payment_type,
      payment_method: form.payment_type === "canje" ? "Canje" : form.payment_method,
      date:           form.date,
      description:    form.description.trim() || undefined,
    });

    setForm(EMPTY);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Editar Ingreso" : "Registrar Ingreso"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div className="flex gap-2">
            {(["monetario", "canje"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange("payment_type", type)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  form.payment_type === type
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {type === "monetario" ? "💵 Monetario" : "🔄 Canje"}
              </button>
            ))}
          </div>

          <Field label="Cliente *">
            <select
              value={form.client_id}
              onChange={(e) => setForm(prev => ({
                ...prev,
                client_id:  e.target.value,
                project_id: "",
                receipt_id: "",
              }))}
              className={INPUT_CLS}
            >
              <option value="">Seleccioná un cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Proyecto (opcional)">
            <select
              value={form.project_id}
              onChange={(e) => setForm(prev => ({
                ...prev,
                project_id: e.target.value,
                receipt_id: "",
              }))}
              className={INPUT_CLS}
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>


          {/* Receipt association — only shown when there are pending receipts */}
          {(form.project_id || form.client_id) && pendingReceipts.length > 0 && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3.5 space-y-2">
              <p className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                <LinkIcon />
                Asociar con recibo pendiente (opcional)
              </p>
              <select
                value={form.receipt_id}
                onChange={(e) => handleReceiptSelect(e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Sin asociar</option>
                {pendingReceipts.map((r: Receipt) => (
                  <option key={r.id} value={r.id}>
                    {r.concept} — {r.amount}
                  </option>
                ))}
              </select>
              {form.receipt_id && (
                <p className="text-xs text-violet-500">
                  ✓ El recibo se marcará como cobrado automáticamente.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Monto (${currency}) *`}>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="ej: 1500"
                readOnly={!!form.receipt_id} 
                className={`${INPUT_CLS} ${form.receipt_id ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
              />
            </Field>
            <Field label="Fecha">
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          {form.payment_type === "monetario" && (
            <Field label="Método de pago">
              <select
                value={form.payment_method}
                onChange={(e) => handleChange("payment_method", e.target.value)}
                className={INPUT_CLS}
              >
                <option>Transferencia</option>
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>PayPal</option>
                <option>Otro</option>
              </select>
            </Field>
          )}

          {form.payment_type === "canje" && (
            <Field label="Descripción del canje">
              <input
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="ej: Servicios de fotografía para portfolio"
                className={INPUT_CLS}
              />
            </Field>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition"
            >
              {mode === "edit" ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}