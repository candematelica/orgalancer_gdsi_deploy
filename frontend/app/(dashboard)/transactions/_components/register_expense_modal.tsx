"use client";

import { useState, useEffect } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { type Expense, type ExpenseCategory } from "../_hooks/use_expenses";

interface SelectOption { id: string; name: string; }

interface Props {
  open:             boolean;
  onClose:          () => void;
  onSave:           (data: ExpensePayload) => Promise<boolean>;
  onCreateCategory: (name: string, color: string | null) => Promise<ExpenseCategory | null>;
  onUpdateCategory: (id: string, name: string, color: string | null) => Promise<ExpenseCategory | null>;
  onRemoveCategory: (id: string) => Promise<boolean>;
  categories:       ExpenseCategory[];
  currency:         string;
  initialData?:     Expense;
  mode?:            "create" | "edit";
}

export interface ExpensePayload {
  category_id: string | null;
  project_id:  string | null;
  amount:      number;
  currency:    string;
  date:        string;
  description: string | null;
}

const PRESET_COLORS = [
  "#EF4444","#F97316","#EAB308","#22C55E",
  "#3B82F6","#8B5CF6","#EC4899","#14B8A6",
];

const EMPTY_FORM = {
  category_id: "",
  project_id:  "",
  amount:      "",
  date:        new Date().toISOString().slice(0, 10),
  description: "",
};

function useProjects(enabled: boolean): SelectOption[] {
  const [projects, setProjects] = useState<SelectOption[]>([]);
  useEffect(() => {
    if (!enabled) return;
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setProjects(data.map((p) => ({ id: p.id, name: p.name }))))
      .catch(() => {});
  }, [enabled]);
  return projects;
}

type CatPanelMode = "none" | "create" | "edit" | "delete";

export default function RegisterExpenseModal({
  open, onClose, onSave, onCreateCategory, onUpdateCategory, onRemoveCategory,
  categories, currency, initialData, mode = "create",
}: Props) {
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [error,      setError]      = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [catPanel,     setCatPanel]     = useState<CatPanelMode>("none");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName,      setCatName]      = useState("");
  const [catColor,     setCatColor]     = useState<string | null>(PRESET_COLORS[0]);
  const [catSaving,    setCatSaving]    = useState(false);
  const [catError,     setCatError]     = useState<string | null>(null);

  const projects = useProjects(open);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialData) {
      setForm({
        category_id: initialData.category_id,
        project_id:  initialData.project_id  ?? "",
        amount:      String(initialData.amount),
        date:        initialData.date,
        description: initialData.description ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
    setCatPanel("none");
  }, [open, mode, initialData]);

  if (!open) return null;

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreate() {
    setCatName(""); setCatColor(PRESET_COLORS[0]); setCatError(null);
    setCatPanel("create"); setEditingCatId(null);
  }

  function openEdit(cat: ExpenseCategory) {
    setCatName(cat.name); setCatColor(cat.color ?? PRESET_COLORS[0]); setCatError(null);
    setCatPanel("edit"); setEditingCatId(cat.id);
  }

  function openDelete(cat: ExpenseCategory) {
    setCatError(null);
    setCatPanel("delete"); setEditingCatId(cat.id);
  }

  function closePanel() {
    setCatPanel("none"); setCatError(null); setEditingCatId(null);
  }

  async function handleCatSave() {
    if (!catName.trim()) { setCatError("Ingresá un nombre."); return; }
    setCatSaving(true); setCatError(null);
    if (catPanel === "create") {
      const created = await onCreateCategory(catName.trim(), catColor);
      if (created) { setForm((p) => ({ ...p, category_id: created.id })); closePanel(); }
      else setCatError("No se pudo crear la categoría.");
    } else if (catPanel === "edit" && editingCatId) {
      const updated = await onUpdateCategory(editingCatId, catName.trim(), catColor);
      if (updated) closePanel();
      else setCatError("No se pudo actualizar la categoría.");
    }
    setCatSaving(false);
  }

  async function handleCatDelete() {
    if (!editingCatId) return;
    setCatSaving(true); setCatError(null);
    const ok = await onRemoveCategory(editingCatId);
    if (ok) {
      if (form.category_id === editingCatId) setForm((p) => ({ ...p, category_id: "" }));
      closePanel();
    } else {
      setCatError("No se pudo eliminar la categoría.");
    }
    setCatSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category_id)              { setError("Seleccioná una categoría."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Ingresá un monto válido."); return; }
    setSubmitting(true);
    const ok = await onSave({
      category_id: form.category_id,
      project_id:  form.project_id || null,
      amount:      parseFloat(form.amount),
      currency,
      date:        form.date,
      description: form.description.trim() || null,
    });
    setSubmitting(false);
    if (ok) { setForm(EMPTY_FORM); setError(null); onClose(); }
  }

  const selectedCat = categories.find((c) => c.id === form.category_id) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Editar Gasto" : "Registrar Gasto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Field label="Categoría *">
            <div className="flex gap-2">
              <select
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className={`${INPUT_CLS} flex-1`}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {selectedCat && (
                <>
                  <button
                    type="button"
                    onClick={() => catPanel === "edit" ? closePanel() : openEdit(selectedCat)}
                    title="Editar categoría"
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-violet-600 hover:border-violet-300 transition"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => catPanel === "delete" ? closePanel() : openDelete(selectedCat)}
                    title="Eliminar categoría"
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-red-500 hover:border-red-300 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => catPanel === "create" ? closePanel() : openCreate()}
                title="Nueva categoría"
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-green-600 hover:border-green-300 transition"
              >
                <Plus size={16} />
              </button>
            </div>

            {catPanel === "delete" && selectedCat && (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50/60 p-3.5 space-y-3">
                <p className="text-xs font-semibold text-red-700">
                  Eliminar "{selectedCat.name}"
                </p>
                <p className="text-xs text-gray-600">
                  Todos los gastos asociados pasarán a quedar sin categoría. Esta acción no se puede deshacer.
                </p>
                {catError && <p className="text-xs text-red-500">{catError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCatDelete}
                    disabled={catSaving}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
                  >
                    {catSaving ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </div>
            )}

            {(catPanel === "create" || catPanel === "edit") && (
              <div className={`mt-2 rounded-xl border p-3.5 space-y-3 ${
                catPanel === "create"
                  ? "border-green-200 bg-green-50/60"
                  : "border-violet-200 bg-violet-50/60"
              }`}>
                <p className={`text-xs font-semibold ${catPanel === "create" ? "text-green-700" : "text-violet-700"}`}>
                  {catPanel === "create" ? "Nueva categoría" : `Editar "${selectedCat?.name}"`}
                </p>
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Nombre (ej: Suscripciones)"
                  className={INPUT_CLS}
                />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c} type="button"
                        onClick={() => setCatColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          catColor === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setCatColor(null)}
                      className={`w-7 h-7 rounded-full border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center transition-transform ${
                        catColor === null ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                      }`}
                    >—</button>
                  </div>
                </div>
                {catError && <p className="text-xs text-red-500">{catError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCatSave}
                    disabled={catSaving}
                    className={`flex-1 py-2 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 ${
                      catPanel === "create"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-violet-600 hover:bg-violet-700"
                    }`}
                  >
                    {catSaving ? "Guardando..." : catPanel === "create" ? "Crear" : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Monto (${currency}) *`}>
              <input
                type="number" min={0}
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="ej: 500"
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Fecha">
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <Field label="Proyecto (opcional)">
            <select
              value={form.project_id}
              onChange={(e) => set("project_id", e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Observaciones (opcional)">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="ej: Renovación anual Adobe CC"
              rows={2}
              className={`${INPUT_CLS} resize-none`}
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}