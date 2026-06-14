"use client";

import { useClientTasks } from "../_hooks/use_client_tasks";

const PRIORITY_STYLES: Record<string, string> = {
  Alta:    "bg-red-100 text-red-600",
  Media:   "bg-yellow-100 text-yellow-700",
  Baja:    "bg-green-100 text-green-700",
  Urgente: "bg-red-200 text-red-700",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TasksTab({ clientId }: { clientId: string }) {
  const { tasks, loading } = useClientTasks(clientId);

  if (loading) return <div className="animate-pulse h-32 bg-gray-50 rounded-2xl" />;

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">Este cliente no tiene tareas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tarea</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Proyecto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vencimiento</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Prioridad</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={t.id} className={`hover:bg-violet-50/30 transition-colors ${i < tasks.length - 1 ? "border-b border-gray-50" : ""}`}>
              <td className="px-6 py-4 text-sm font-medium text-gray-800">{t.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{t.project_name ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-gray-400">{formatDate(t.target_date)}</td>
              <td className="px-6 py-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[t.priority] ?? "bg-gray-100 text-gray-500"}`}>
                  {t.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 capitalize">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}