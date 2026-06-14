"use client";

import { useEffect, useState } from "react";

const PRIORITY_STYLES: Record<string, string> = {
  Alta:    "bg-red-500 text-white",
  Media:   "bg-yellow-400 text-white",
  Baja:    "bg-green-500 text-white",
  Urgente: "bg-red-700 text-white",
};

interface Task {
  id: string;
  title: string;
  target_date: string | null;
  priority: string;
  status: string;
  project_name: string | null;
}

function formatDue(dateStr: string | null): string {
  if (!dateStr) return "Sin fecha";
  const target = new Date(dateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return `Vencida hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`;
  if (diff === 0) return "Vence: Hoy";
  if (diff === 1) return "Vence: Mañana";
  return `Vence: ${diff} días`;
}

function DueBadge({ dateStr }: { dateStr: string | null }) {
  if (!dateStr) return <p className="text-gray-400 text-xs">Sin fecha</p>;
  const target = new Date(dateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diff < 0;
  return (
    <p className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
      {formatDue(dateStr)}
    </p>
  );
}

export default function PendingTasks() {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) return;
        const all: Task[] = await res.json();

        const pending = all
          .filter((t) => t.status === "pending" || t.status === "Pendiente" || t.status === "En Progreso" || t.status === "in_progress")
          .sort((a, b) => {
            if (!a.target_date) return 1;
            if (!b.target_date) return -1;
            return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
          })
          .slice(0, 3);

        setTasks(pending);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-4 w-36 bg-gray-100 rounded mb-5" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-violet-600 font-bold text-base mb-4">Tareas Pendientes</h2>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-200 mb-3">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-gray-400 text-sm">No hay tareas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-gray-300 shrink-0">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="min-w-0">
                  <p className="text-gray-700 text-sm font-medium truncate">{task.title}</p>
                  <DueBadge dateStr={task.target_date} />
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ml-2 ${PRIORITY_STYLES[task.priority] ?? "bg-gray-100 text-gray-500"}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}