import { EnrichedProject } from "../_hooks/use_projects";
import { ViewMode } from "../_hooks/use_projects";
import ProjectCard from "./project_card";
import ProjectListRow from "./project_list_row";
import EmptyState from "./empty_state";

interface ProjectsGridProps {
  projects: EnrichedProject[];
  viewMode: ViewMode;
  loading: boolean;
  activeFilter: string;
  currency?: string;
  onNewProject?: () => void;
  onEdit: (project: EnrichedProject) => void;
  onStateChange: () => void;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-4 bg-gray-100 rounded" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-full bg-gray-100 rounded mb-1" />
      <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
      <div className="h-3 w-1/3 bg-gray-100 rounded mb-1" />
      <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
      <div className="h-2 w-full bg-gray-100 rounded mb-3" />
      <div className="border-t border-gray-100 pt-3 flex justify-between">
        <div className="h-4 w-16 bg-gray-100 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function ProjectsGrid({
  projects,
  viewMode,
  loading,
  activeFilter,
  currency,
  onNewProject,
  onEdit,
}: ProjectsGridProps) {
  if (loading) {
    return viewMode === "grid" ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        filtered={activeFilter !== "all"}
        onNewProject={onNewProject}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <ProjectListRow key={project.id} project={project} currency={currency} onEdit={onEdit} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} currency={currency} onEdit={onEdit} />
      ))}
    </div>
  );
}