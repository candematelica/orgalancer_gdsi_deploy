import { LayoutGrid, List } from "lucide-react";
import { FilterTab, FILTER_TABS, ViewMode } from "../_hooks/use_projects";

interface ProjectFiltersProps {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ProjectFilters({
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              activeFilter === tab.key
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid / List toggle */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 self-start sm:self-auto">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === "grid"
              ? "bg-violet-600 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Grid
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            viewMode === "list"
              ? "bg-violet-600 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <List className="w-4 h-4" />
          Lista
        </button>
      </div>
    </div>
  );
}