"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { type Transaction } from "./transaction_list";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void;
  currency: string;
}

const EMPTY = {
  project_name: "",
  client_name: "",
  amount: "",
  payment_type: "monetario" as "monetario" | "canje",
  payment_method: "Transferencia",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

export default function RegisterIncomeModal({ open, onClose, onSave, currency }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleChange(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.project_name.trim() || !form.client_name.trim() || !form.amount) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    onSave({
      project_name: form.project_name.trim(),
      client_name: form.client_name.trim(),
      amount: parseFloat(form.amount),
      currency,
      payment_type: form.payment_type,
      payment_method: form.payment_type === "canje" ? "Canje" : form.payment_method,
      date: form.date,
      description: form.description.trim() || undefined,
    });
    setForm(EMPTY);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
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

          <Field label="Nombre del proyecto *">
            <input
              value={form.project_name}
              onChange={(e) => handleChange("project_name", e.target.value)}
              placeholder="ej: Diseño de identidad corporativa"
              className={INPUT_CLS}
            />
          </Field>

          <Field label="Cliente *">
            <input
              value={form.client_name}
              onChange={(e) => handleChange("client_name", e.target.value)}
              placeholder="ej: TechStartup SL"
              className={INPUT_CLS}
            />
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
