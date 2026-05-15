import { User, Calendar } from "lucide-react";
import Link from "next/link";
import { EnrichedProject } from "../_hooks/use_projects";
import ProgressBar from "./progress_bar";
import StatusBadge from "./status_badge";
import DeadlineChip from "./deadline_chip";

interface ProjectListRowProps {
  project: EnrichedProject;
  currency?: string;
}

function formatCurrency(value: number, currency = "€") {
  const safeValue = value ?? 0.00;
  return `${currency}${safeValue.toLocaleString("es-ES")}`;
}

export default function ProjectListRow({
  project,
  currency = "€",
}: ProjectListRowProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Name + description + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {project.name}
          </h3>
          <StatusBadge status={project.state} />
        </div>
        {project.description && (
          <p className="text-xs text-gray-500 truncate mb-1">
            {project.description}
          </p>
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
          percentage={project._computed_progress}
          alert={project._computed_alert}
        />
        <p className="text-xs text-gray-400 mt-1">
          {project.completed_tasks}/{project.total_tasks} tareas
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

      {/* CTA */}
      <Link
        href={`/projects/${project.id}`}
        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
      >
        Ver Detalles
      </Link>
    </div>
  );
}