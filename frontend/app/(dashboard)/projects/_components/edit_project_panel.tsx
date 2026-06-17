"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateProject } from "../_hooks/update_project";

interface EditProjectPanelProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    contract_type: string;
    estimated_budget: number;
    deadline: string | null;
  } | null;
  onClose: () => void;
  onSaved: () => void;
}

const INPUT_CLS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function EditProjectPanel({ project, onClose, onSaved }: EditProjectPanelProps) {
  const { formData, setFormData, handleSubmit, saving, error, saved } = useUpdateProject(project, onSaved, onClose);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Editar proyecto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
              ✓ Guardado correctamente
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre *">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={INPUT_CLS}
              />
            </Field>

            <Field label="Tipo de contrato">
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData((p) => ({ ...p, contract_type: e.target.value as any }))}
                className={INPUT_CLS}
              >
                <option value="fixed_price">Precio fijo</option>
                <option value="hourly">Por hora</option>
                <option value="retainer">Retainer</option>
              </select>
            </Field>

            <Field label="Presupuesto estimado">
              <input
                type="number"
                min={0}
                value={formData.estimated_budget}
                onChange={(e) => setFormData((p) => ({ ...p, estimated_budget: Number(e.target.value) }))}
                className={INPUT_CLS}
              />
            </Field>

            <Field label="Fecha límite">
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <Field label="Descripción (opcional)">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descripción del proyecto (opcional)"
              rows={3}
              className={`${INPUT_CLS} resize-none`}
            />
          </Field>

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
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 hover:shadow-lg"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}