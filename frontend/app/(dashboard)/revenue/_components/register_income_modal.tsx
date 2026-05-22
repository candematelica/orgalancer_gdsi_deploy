"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { type Transaction } from "./transaction_list";

interface SelectOption { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void;
  currency: string;
}

const EMPTY = {
  client_id: "",
  project_id: "",
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
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(apiPath, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setOptions(data.map((d) => ({ id: d.id, name: d.name }))))
      .catch(() => {});
  }, [apiPath, enabled]);
  return options;
}

export default function RegisterIncomeModal({ open, onClose, onSave, currency }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const clients  = useOptions("/api/clients",  open);
  const projects = useOptions("/api/projects", open);

  if (!open) return null;

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
      client_id:    form.client_id,
      project_id:   form.project_id || null,
      client_name:  client?.name  ?? "",
      project_name: project?.name ?? "Sin proyecto",
      amount:       parseFloat(form.amount),
      currency,
      payment_type:   form.payment_type,
      payment_method: form.payment_type === "canje" ? "Canje" : form.payment_method,
      date:        form.date,
      description: form.description.trim() || undefined,
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
          <h2 className="text-lg font-bold text-gray-900">Registrar Ingreso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de pago */}
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
              onChange={(e) => handleChange("client_id", e.target.value)}
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
              onChange={(e) => handleChange("project_id", e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Monto (${currency}) *`}>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="ej: 1500"
                className={INPUT_CLS}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
