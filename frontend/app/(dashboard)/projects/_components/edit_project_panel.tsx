"use client";

import { useEffect } from "react";
import { X, Save } from "lucide-react";
import { useUpdateProject } from "../_hooks/update_project";

interface EditProjectPanelProps {
  project: { id: string; name: string; contract_type: string; estimated_budget: number; deadline: string | null } | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProjectPanel({ project, onClose, onSaved }: EditProjectPanelProps) {
  const { formData, setFormData, handleSubmit, saving, error, saved } = useUpdateProject(project, onSaved, onClose);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isOpen = !!project;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Editar proyecto</h2>
            <p className="text-xs text-gray-400 mt-0.5">Los cambios se guardan al confirmar</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}
          {saved && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              ✓ Guardado correctamente
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato</label>
            <select
              value={formData.contract_type}
              onChange={(e) => setFormData((p) => ({ ...p, contract_type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="fixed_price">Precio fijo</option>
              <option value="hourly">Por hora</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto estimado</label>
            <input
              type="number"
              min={0}
              value={formData.estimated_budget}
              onChange={(e) => setFormData((p) => ({ ...p, estimated_budget: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </>
  );
}