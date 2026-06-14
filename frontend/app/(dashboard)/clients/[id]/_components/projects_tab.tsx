"use client";

import { useRouter } from "next/navigation";
import { useClientProjects } from "../_hooks/use_client_project";

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: "Activo",     color: "bg-green-100 text-green-700" },
  completed: { label: "Finalizado", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelado",  color: "bg-red-100 text-red-600" },
  paused:    { label: "Pausado",    color: "bg-yellow-100 text-yellow-700" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectsTab({ clientId }: { clientId: string }) {
  const router = useRouter();
  const { projects, loading } = useClientProjects(clientId);

  if (loading) return <div className="animate-pulse h-32 bg-gray-50 rounded-2xl" />;

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">Este cliente no tiene proyectos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Proyecto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Presupuesto</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Creado</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => {
            const stateInfo = STATE_LABELS[p.state] ?? { label: p.state, color: "bg-gray-100 text-gray-600" };
            return (
              <tr
                key={p.id}
                onClick={() => router.push(`/projects/${p.id}`)}
                className={`hover:bg-violet-50/30 cursor-pointer transition-colors ${i < projects.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stateInfo.color}`}>
                    {stateInfo.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.budget != null ? `${p.currency} ${p.budget.toLocaleString("es-AR")}` : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(p.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}