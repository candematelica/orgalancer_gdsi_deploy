"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "../_hooks/use_expenses";

interface SelectOption { id: string; name: string; }

function useOptions(apiPath: string): SelectOption[] {
  const [options, setOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    fetch(apiPath).then(r => r.ok ? r.json() : []).then((data: any[]) =>
      setOptions(data.map(d => ({ id: d.id, name: d.name })))
    ).catch(() => {});
  }, [apiPath]);
  return options;
}

function fmt(amount: number, currency = "$") {
  return `${currency}${amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`;
}

export default function ExpensesShell({ currency = "$" }: { currency?: string }) {
  const { expenses, loading, error, load, total } = useExpenses();
  const projects   = useOptions("/api/projects");
  const categories = useOptions("/api/expenses/categories");

  const [projectId,  setProjectId]  = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => { load(); }, []);

  function applyFilters() {
    load({
      project_id:  projectId  || undefined,
      category_id: categoryId || undefined,
    });
  }

  function clearFilters() {
    setProjectId(""); setCategoryId("");
    load();
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Proyecto</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
            <option value="">Todos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
            <option value="">Todas</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={applyFilters}
          className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition">
          Filtrar
        </button>
        <button onClick={clearFilters}
          className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">
          Limpiar
        </button>
      </div>

      {/* Total */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total gastos</span>
        <span className="text-lg font-semibold text-red-500">{fmt(total, currency)}</span>
      </div>

      {/* Lista */}
      {loading && <p className="text-sm text-gray-400">Cargando...</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && expenses.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No hay gastos registrados.</p>
      )}
      {!loading && !error && expenses.map(exp => (
        <div key={exp.id} className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center gap-3">
            {exp.category_color && (
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: exp.category_color }} />
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">
                {exp.description ?? exp.category_name ?? "Sin descripción"}
              </p>
              <p className="text-xs text-gray-400">
                {exp.category_name}{exp.project_name ? ` · ${exp.project_name}` : ""} · {exp.date}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-red-500">
            -{fmt(exp.amount, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}