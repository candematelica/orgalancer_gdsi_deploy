import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  filtered?: boolean;
  onNewProject?: () => void;
}

export default function EmptyState({ filtered = false, onNewProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {filtered ? "Sin resultados para este filtro" : "Aún no tenés proyectos"}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        {filtered
          ? "Probá con otro estado o mostrá todos los proyectos."
          : "Creá tu primer proyecto y empezá a hacer seguimiento de tu trabajo freelance."}
      </p>
      {!filtered && onNewProject && (
        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
        >
          + Nuevo Proyecto
        </button>
      )}
    </div>
  );
}