"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, RefreshCw, X } from "lucide-react";
import type { TimeFilters } from "../_hooks/use_time_entries";

interface Props {
  filters:        TimeFilters;
  initialFilters: TimeFilters;
  projects:       { id: string; name: string }[];
  tasks:          { id: string; name: string }[];
  loading:        boolean;
  onApply:        (f: TimeFilters) => void;
  onClear:        () => void;
  onRemove:       (key: keyof TimeFilters) => void;
}

const SEL = "px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full md:w-auto min-w-[160px]";
const DTE = "px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full md:w-auto";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function FilterBar({
  filters, initialFilters, projects, tasks, loading, onApply, onClear, onRemove,
}: Props) {
  const [draft, setDraft] = useState<TimeFilters>(filters);
  const [open, setOpen]   = useState(false);

  useEffect(() => { setDraft(filters); }, [filters]);

  const set = (k: keyof TimeFilters, v: string) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const handleSelectChange = (k: keyof TimeFilters, v: string) => {
    const next = { ...draft, [k]: v };
    setDraft(next);
    onApply(next);
  };

  const handleApply = () => { onApply(draft); setOpen(false); };
  const handleClear = () => { onClear(); setOpen(false); };

  const pills: { key: keyof TimeFilters; label: string }[] = [];
  if (filters.project_id) {
    const name = projects.find((p) => p.id === filters.project_id)?.name ?? filters.project_id;
    pills.push({ key: "project_id", label: `Proyecto: ${name}` });
  }
  if (filters.task_id) {
    const name = tasks.find((t) => t.id === filters.task_id)?.name ?? filters.task_id;
    pills.push({ key: "task_id", label: `Tarea: ${name}` });
  }
  if (filters.source) {
    pills.push({ key: "source", label: `Tipo: ${filters.source === "timer" ? "Timer" : "Manual"}` });
  }
  const dateChanged = filters.from !== initialFilters.from || filters.to !== initialFilters.to;
  if (dateChanged) {
    pills.push({ key: "from", label: `${fmtDate(filters.from)} → ${fmtDate(filters.to)}` });
  }

  const hasActiveFilters = pills.length > 0;

  return (
    <div className="space-y-2">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <SlidersHorizontal size={14} className="text-violet-400" />
            Filtros adicionales
            {loading && <RefreshCw size={12} className="animate-spin text-violet-400 ml-1" />}
            {!loading && hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                {pills.length}
              </span>
            )}
          </span>
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </button>

        {open && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
            <div className="flex flex-wrap items-center gap-3">
              <select value={draft.project_id} onChange={(e) => handleSelectChange("project_id", e.target.value)} className={SEL}>
                <option value="">Todos los proyectos</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select value={draft.task_id} onChange={(e) => handleSelectChange("task_id", e.target.value)} className={SEL}>
                <option value="">Todas las tareas</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select value={draft.source} onChange={(e) => handleSelectChange("source", e.target.value)} className={SEL}>
                <option value="">Todos los tipos</option>
                <option value="manual">Manual</option>
                <option value="timer">Timer</option>
              </select>

              <input type="date" value={draft.from} onChange={(e) => set("from", e.target.value)} className={DTE} title="Desde" />
              <input type="date" value={draft.to}   onChange={(e) => set("to",   e.target.value)} className={DTE} title="Hasta" />

              <div className="flex gap-2 ml-auto">
                <button onClick={handleApply} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow flex items-center gap-2">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Aplicar
                </button>
                <button onClick={handleClear} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors bg-white">
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-gray-400 font-medium">Activos:</span>
          {pills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-full"
            >
              {pill.label}
              <button onClick={() => onRemove(pill.key)} className="hover:text-violet-900 transition-colors" title="Quitar filtro">
                <X size={11} />
              </button>
            </span>
          ))}
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}