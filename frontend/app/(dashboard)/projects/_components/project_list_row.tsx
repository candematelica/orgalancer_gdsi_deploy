import { User, Pencil } from "lucide-react";
import Link from "next/link";
import { EnrichedProject } from "../_hooks/use_projects";
import ProgressBar from "./progress_bar";
import StatusBadge from "./status_badge";
import DeadlineChip from "./deadline_chip";
import ConfirmCompleteDialog from "./confirm_complete_dialog";
import { useState } from "react";

interface ProjectListRowProps {
  project: EnrichedProject;
  currency?: string;
  onEdit?: (project: EnrichedProject) => void;
  onStateChange?: () => void;
}

function formatCurrency(value: number, currency = "€") {
  const safeValue = value ?? 0.0;
  return `${currency}${safeValue.toLocaleString("es-ES")}`;
}

export default function ProjectListRow({
  project,
  currency = "€",
  onEdit,
  onStateChange,
}: ProjectListRowProps) {
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

  return (
    <>
      <ConfirmCompleteDialog
        isOpen={showConfirmDialog}
        projectName={project.name}
        pendingTasksCount={pendingTasksCount}
        onConfirm={() => { setShowConfirmDialog(false); applyStateChange("completed"); }}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Read-only banner */}
        {isReadOnly && (
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Solo lectura</span>
          </div>
        )}

        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{project.name}</h3>
              <StatusBadge status={currentState} />
              {!isReadOnly && onEdit && (
                <button
                  onClick={() => onEdit(project)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-gray-500 truncate mb-1">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {project.client_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {project.client_name}
                </span>
              )}
              {project.deadline && (
                <DeadlineChip
                  deadlineStr={project.deadline}
                  daysUntil={project._computed_days}
                  alert={project._computed_alert}
                />
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="w-full sm:w-40">
            <ProgressBar
              percentage={currentState === "completed" ? 100 : project._computed_progress}
              alert={isReadOnly ? null : project._computed_alert}
            />
            <p className="text-xs text-gray-400 mt-1">
              {currentState === "completed" ? currentTasks.total : currentTasks.completed}/
              {currentTasks.total} tareas
            </p>
          </div>

          {/* Financials */}
          <div className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
            <div>
              <p className="text-xs text-gray-400">Ganado</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(project.earned, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Presupuesto</p>
              <p className="text-sm font-semibold text-gray-500">
                {formatCurrency(project.estimated_budget, currency)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentState === "active" && (
              <>
                <button
                  onClick={handleCompleteClick}
                  disabled={isChangingState}
                  className="py-1.5 px-3 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  ✓ Completar
                </button>
                <button
                  onClick={() => applyStateChange("cancelled")}
                  disabled={isChangingState}
                  className="py-1.5 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  ✕ Cancelar
                </button>
              </>
            )}
            {currentState === "cancelled" && (
              <button
                onClick={() => applyStateChange("active")}
                disabled={isChangingState}
                className="py-1.5 px-3 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                ↩ Reactivar
              </button>
            )}

            <Link
              href={`/projects/${project.id}`}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}