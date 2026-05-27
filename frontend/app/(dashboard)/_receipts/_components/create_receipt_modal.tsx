"use client";

// Modal to create a new receipt.
// It can receive pre-selected project and client IDs (that's how it's used in projects/[id]/...) but also works without them (for a future use case).
// It doesn't make any API calls itself.

import { useState } from "react";
import { ReceiptCreatePayload } from "../types";

interface Props {
  open:        boolean;
  projectId:   string | null;
  clientId:    string | null;
  clientName:  string | null;
  onClose:     () => void;
  onCreated:   () => void;
  onCreate:    (payload: ReceiptCreatePayload) => Promise<boolean>;
}

const todayISO = () => new Date().toISOString().split("T")[0];

export default function CreateReceiptModal({
  open, projectId, clientId, clientName, onClose, onCreated, onCreate,
}: Props) {
  const [concept,             setConcept]             = useState("");
  const [amount,              setAmount]              = useState("");
  const [dateEmitted,         setDateEmitted]         = useState(todayISO());
  const [selectedProjectId,   setSelectedProjectId]   = useState("");
  const [selectedClientId,    setSelectedClientId]    = useState("");
  const [submitting,          setSubmitting]          = useState(false);
  const [error,               setError]               = useState<string | null>(null);

  if (!open) return null;

  const resolvedProjectId = (projectId ?? selectedProjectId) || undefined;
  const resolvedClientId  = (clientId  ?? selectedClientId)  || undefined;

  const reset = () => {
    setConcept("");
    setAmount("");
    setDateEmitted(todayISO());
    setSelectedProjectId("");
    setSelectedClientId("");
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError(null);

    if (!concept.trim()) { setError("El concepto es requerido."); return; }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("El monto debe ser mayor a 0.");
      return;
    }
    if (!dateEmitted) { setError("La fecha de emisión es requerida."); return; }
    if (!resolvedProjectId) { setError("Seleccioná un proyecto."); return; }

    setSubmitting(true);
    const ok = await onCreate({
      concept:      concept.trim(),
      amount:       parsed,
      date_emitted: dateEmitted,
      project_id:   resolvedProjectId,
      client_id:    resolvedClientId,
    });
    setSubmitting(false);

    if (ok) { reset(); onCreated(); }
  };

  const isStandalone = projectId === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nuevo Recibo</h2>
            {!isStandalone && clientName && (
              <p className="text-sm text-gray-400 mt-0.5">Cliente: {clientName}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="space-y-4">
          {isStandalone && (
            <>
              <Field label="Proyecto" required>
                <input
                  type="text"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  placeholder="ID o selector de proyecto"
                  className={inputCls}
                />
              </Field>

              <Field label="Cliente">
                <input
                  type="text"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  placeholder="ID o selector de cliente (opcional)"
                  className={inputCls}
                />
              </Field>
            </>
          )}

          <Field label="Concepto" required>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Diseño de landing page"
              className={inputCls}
            />
          </Field>

          <Field label="Monto" required>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>

          <Field label="Fecha de emisión" required>
            <input
              type="date"
              value={dateEmitted}
              onChange={(e) => setDateEmitted(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {submitting ? "Creando..." : "Crear Recibo"}
          </button>
        </div>
      </div>
    </div>
  );
}


const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 " +
  "placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 " +
  "focus:border-transparent transition";

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}