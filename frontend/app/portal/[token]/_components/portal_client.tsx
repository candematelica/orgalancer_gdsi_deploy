"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText,
  ArrowLeft,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  start_date?: string;
  deadline?: string;
  estimated_budget?: number;
  contract_type?: string;
  clients?: { name: string } | null;
}

interface Props {
  project: Project;
  tasks: Task[];
  freelancerName: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: "En Progreso",
  in_progress: "En Progreso",
  completed: "Completado",
  paused: "Pausado",
  cancelled: "Cancelado",
  pending: "Pendiente",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  completed: "Completada",
  in_progress: "En progreso",
  pending: "Pendiente",
  todo: "Pendiente",
};

function taskIcon(status: string) {
  if (status === "completed")
    return <CheckCircle2 className="w-5 h-5 text-purple-300" />;
  if (status === "in_progress")
    return <Clock className="w-5 h-5 text-indigo-300" />;
  return <Circle className="w-5 h-5 text-white/30" />;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysRemaining(deadline?: string) {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default function PortalClient({ project, tasks, freelancerName }: Props) {
  const [tasksExpanded, setTasksExpanded] = useState(true);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const pendingTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "in_progress"
  ).length;

  const days = daysRemaining(project.deadline);
  const daysLabel =
    days === null
      ? "—"
      : days < 0
      ? `${Math.abs(days)} días vencido`
      : days === 0
      ? "Hoy"
      : `${days} días restantes`;
  const daysColor = days !== null && days < 7 ? "text-red-300" : "text-indigo-200";

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 40%, #1a1a4e 100%)",
      }}
    >
      {/* Header bar */}
      <div className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {freelancerName[0]}
            </div>
            <span className="text-white/80 text-sm font-medium">
              {freelancerName} · Portal del Cliente
            </span>
          </div>
          <span className="text-white/40 text-xs">Solo lectura</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Project hero card */}
        <div
          className="rounded-2xl p-6 border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.15) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {project.clients?.name && (
                <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">
                  Proyecto para {project.clients.name}
                </p>
              )}
              <h1 className="text-2xl font-bold text-white leading-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-white/60 text-sm mt-1">{project.description}</p>
              )}
            </div>
            <span
              className={`
                shrink-0 px-3 py-1 rounded-full text-xs font-semibold
                ${
                  project.status === "active" || project.status === "in_progress"
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                    : project.status === "completed"
                    ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
                    : "bg-white/10 text-white/60 border border-white/20"
                }
              `}
            >
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-sm">Progreso general</span>
              <span className="text-white font-semibold">{project.progress ?? 0}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${project.progress ?? 0}%`,
                  background: "linear-gradient(90deg, #a855f7, #6366f1)",
                }}
              />
            </div>
          </div>

          {/* Date stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label="Inicio"
              value={formatDate(project.start_date)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Stat
              label="Entrega estimada"
              value={formatDate(project.deadline)}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Stat
              label="Tiempo restante"
              value={daysLabel}
              icon={<Clock className="w-4 h-4" />}
              valueClass={daysColor}
            />
            <Stat
              label="Tareas completadas"
              value={`${completedTasks} / ${tasks.length}`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Tasks card */}
        {tasks.length > 0 && (
          <div
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
            }}
          >
            <button
              onClick={() => setTasksExpanded((p) => !p)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-300" />
                <span className="text-white font-semibold">Avance de tareas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs">
                  {completedTasks} completadas · {inProgressTasks} en progreso ·{" "}
                  {pendingTasks} pendientes
                </span>
                {tasksExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/40" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                )}
              </div>
            </button>

            {tasksExpanded && (
              <div className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-6 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      {taskIcon(task.status)}
                      <span
                        className={`text-sm ${
                          task.status === "completed"
                            ? "line-through text-white/40"
                            : "text-white/80"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === "completed"
                          ? "bg-purple-500/20 text-purple-300"
                          : task.status === "in_progress"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {TASK_STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto px-4 pb-8 text-center">
        <p className="text-white/20 text-xs">
          Portal generado por{" "}
          <span className="text-white/40 font-medium">{freelancerName}</span>
          {" · "}Solo lectura para el cliente
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}