"use client";

import { useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import SectionHeader    from "../_components/section_header";
import FilterBar        from "./_components/filter_bar";
import TimeStatCards    from "./_components/time_stat_cards";
import TimeBarChart     from "./_components/time_bar_chart";
import ProjectBreakdown from "./_components/project_breakdown";
import ActivityHeatmap  from "./_components/activity_heat_map";
import TimeEntriesTable from "./_components/time_entries_table";
import QuickPeriodTabs  from "./_components/quick_period_tabs";
import { useTimeEntries } from "./_hooks/use_time_entries";
import type { QuickPeriod } from "./_hooks/use_time_entries";

function buildPeriodLabel(
  filters: { from: string; to: string; project_id: string; source: string },
  projects: { id: string; name: string }[],
  quickPeriod: QuickPeriod | null,
): string {
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "short", year: "numeric",
    });
  const quickLabels: Record<QuickPeriod, string> = {
    today: "Hoy",
    week:  "Esta semana",
    month: "Este mes",
  };
  const base = quickPeriod ? quickLabels[quickPeriod] : `${fmt(filters.from)} al ${fmt(filters.to)}`;
  const parts: string[] = [base];
  if (filters.project_id) {
    const name = projects.find((p) => p.id === filters.project_id)?.name;
    if (name) parts.push(name);
  }
  if (filters.source) parts.push(filters.source === "timer" ? "Timer" : "Manual");
  return parts.join(" · ");
}

export default function TimePage() {
  const {
    entries, loading, error,
    filters,
    periodView, setPeriodView,
    quickPeriod, applyQuickPeriod,
    applyFilters, clearFilters, removeFilter,
    fetchAll, fetchFiltered,
    totalMinutes, activeDays, avgMinutesPerDay,
    topProject, projectSummaries,
    buckets, heatmap,
    uniqueProjects, uniqueTasks,
    INITIAL_FILTERS,
  } = useTimeEntries();

  useEffect(() => {
    fetchAll();
    fetchFiltered(filters);
  }, []);

  const periodLabel = useMemo(
    () => buildPeriodLabel(filters, uniqueProjects, quickPeriod),
    [filters, uniqueProjects, quickPeriod],
  );

  return (
    <div className="pb-10 space-y-5">
      <SectionHeader
        title="Registro de Tiempo"
        subtitle="Resumen y historial completo de tus entradas de tiempo"
        icon={<Clock className="w-8 h-8 text-violet-600" />}
      />

      <QuickPeriodTabs active={quickPeriod} loading={loading} onChange={applyQuickPeriod} />

      <FilterBar
        filters={filters}
        initialFilters={INITIAL_FILTERS}
        projects={uniqueProjects}
        tasks={uniqueTasks}
        loading={loading}
        onApply={applyFilters}
        onClear={clearFilters}
        onRemove={removeFilter}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
          <p className="text-red-700 text-sm font-medium">Error al cargar: {error}</p>
        </div>
      )}

      <TimeStatCards
        totalMinutes={totalMinutes}
        activeDays={activeDays}
        avgMinutesPerDay={avgMinutesPerDay}
        topProject={topProject}
        entryCount={entries.length}
        periodLabel={periodLabel}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TimeBarChart
            buckets={buckets}
            periodView={periodView}
            onChangePeriod={setPeriodView}
            periodLabel={periodLabel}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-1">
          <ProjectBreakdown summaries={projectSummaries} loading={loading} />
        </div>
      </div>

      <TimeEntriesTable
        entries={entries}
        filters={filters}
        loading={loading}
        periodLabel={periodLabel}
      />

      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Actividad anual · independiente de los filtros</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <ActivityHeatmap cells={heatmap} />
    </div>
  );
}