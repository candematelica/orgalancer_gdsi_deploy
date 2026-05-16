import { User, Calendar } from "lucide-react";
import Link from "next/link";
import { EnrichedProject } from "../_hooks/use_projects";
import ProgressBar from "./progress_bar";
import StatusBadge from "./status_badge";
import DeadlineChip from "./deadline_chip";

interface ProjectCardProps {
  project: EnrichedProject;
  currency?: string;
}

function formatCurrency(value: number, currency = "€") {
  return `${currency}${value.toLocaleString("es-ES")}`;
}

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  hourly: "Por hora",
  fixed_price: "Precio fijo",
  retainer: "Retainer",
};

export default function ProjectCard({
  project,
  currency = "€",
}: ProjectCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
      {/* Top section */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {/* Contract type icon indicator */}
            <span className="w-5 h-5 text-gray-400">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
          </div>
          <StatusBadge status={project.state} />
        </div>

        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Client */}
        {project.client_name && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>{project.client_name}</span>
          </div>
        )}

        {/* Dates */}
        {(project.start_date || project.deadline) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {project.start_date ? formatDate(project.start_date) : "—"}{" "}
              {project.deadline ? `- ${formatDate(project.deadline)}` : ""}
            </span>
          </div>
        )}

        {/* Deadline alert chip */}
        {project.deadline && (
          <div className="mb-3">
            <DeadlineChip
              deadlineStr={project.deadline}
              daysUntil={project._computed_days}
              alert={project._computed_alert}
            />
          </div>
        )}

        {/* Progress */}
        <ProgressBar
          percentage={project._computed_progress}
          alert={project._computed_alert}
          className="mb-2"
        />
        <p className="text-xs text-gray-400">
          {project.completed_tasks}/{project.total_tasks} tareas
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
    </div>
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