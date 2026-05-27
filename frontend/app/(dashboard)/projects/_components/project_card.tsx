import { User, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import { EnrichedProject } from "../_hooks/use_projects";
import ProgressBar from "./progress_bar";
import StatusBadge from "./status_badge";
import DeadlineChip from "./deadline_chip";
import ConfirmCompleteDialog from "./confirm_complete_dialog";
import { useState } from "react";

interface ProjectCardProps {
  project: EnrichedProject;
  currency?: string;
  onEdit: (project: EnrichedProject) => void;
  onStateChange?: () => void;
}

function formatCurrency(value: number, currency = "€") {
  return `${currency}${value.toLocaleString("es-ES")}`;
}

export default function ProjectCard({
  project,
  currency = "€",
  onEdit,
  onStateChange,
}: ProjectCardProps) {
  const [currentState, setCurrentState] = useState(project.state);
  const [currentTasks, setCurrentTasks] = useState({
    total: project.total_tasks,
    completed: project.completed_tasks,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChangingState, setIsChangingState] = useState(false);

  const pendingTasksCount = currentTasks.total - currentTasks.completed;
  const isReadOnly = currentState === "completed" || currentState === "cancelled";

  async function applyStateChange(newState: "completed" | "cancelled" | "active") {
    const previousState = currentState;
    setIsChangingState(true);
    setCurrentState(newState);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, state: newState }),
      });

      if (res.ok) {
        // If completing, all tasks are now done
        if (newState === "completed") {
          setCurrentTasks((prev) => ({ ...prev, completed: prev.total }));
        }
        onStateChange?.();
      } else {
        setCurrentState(previousState);
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setCurrentState(previousState);
    } finally {
      setIsChangingState(false);
    }
  }

  function handleCompleteClick() {
    if (pendingTasksCount > 0) {
      setShowConfirmDialog(true);
    } else {
      applyStateChange("completed");
    }
  }

  function handleConfirmComplete() {
    setShowConfirmDialog(false);
    applyStateChange("completed");
  }

  return (
    <>
      <ConfirmCompleteDialog
        isOpen={showConfirmDialog}
        projectName={project.name}
        pendingTasksCount={pendingTasksCount}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <div
        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden ${isReadOnly ? "border-gray-100 opacity-90" : "border-gray-100"
          }`}
      >
        {/* Read-only banner */}
        {isReadOnly && (
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Solo lectura</span>
          </div>
        )}

        {/* Top section */}
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-5 h-5 text-gray-400">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <button
                  onClick={() => onEdit(project)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
              )}
              <StatusBadge status={currentState} />
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
            {project.name}
          </h3>

          {project.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
          )}

          {project.client_name && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>{project.client_name}</span>
            </div>
          )}

          {(project.start_date || project.deadline) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {project.start_date ? formatDate(project.start_date) : "—"}{" "}
                {project.deadline ? `- ${formatDate(project.deadline)}` : ""}
              </span>
            </div>
          )}

          {project.deadline && (
            <div className="mb-3">
              <DeadlineChip
                deadlineStr={project.deadline}
                daysUntil={project._computed_days}
                alert={project._computed_alert}
              />
            </div>
          )}

          <ProgressBar
            percentage={
              currentState === "completed"
                ? 100
                : project._computed_progress
            }
            alert={isReadOnly ? null : project._computed_alert}
            className="mb-2"
          />
          <p className="text-xs text-gray-400">
            {currentState === "completed" ? currentTasks.total : currentTasks.completed}/
            {currentTasks.total} tareas
          </p>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Ganado</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(project.earned, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Presupuesto</p>
            <p className="text-sm font-semibold text-gray-500">
              {formatCurrency(project.estimated_budget, currency)}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-4">
          <Link
            href={`/projects/${project.id}`}
            className="block w-full text-center py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
          >
            Ver Detalles
          </Link>
        </div>

        {/* State actions — only for active projects */}
        {currentState === "active" && (
          <div className="px-5 pb-4 flex gap-2">
            <button
              onClick={handleCompleteClick}
              disabled={isChangingState}
              className="flex-1 py-2 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 text-xs font-medium transition-colors disabled:opacity-50"
            >
              ✓ Completar
            </button>
            <button
              onClick={() => applyStateChange("cancelled")}
              disabled={isChangingState}
              className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50"
            >
              ✕ Cancelar
            </button>
          </div>
        )}

        {/* Reactivate — only for cancelled projects */}
        {currentState === "cancelled" && (
          <div className="px-5 pb-4">
            <button
              onClick={() => applyStateChange("active")}
              disabled={isChangingState}
              className="w-full py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors disabled:opacity-50"
            >
              ↩ Reactivar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}