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
import { useTimeEntries } from "./_hooks/use_time_entries";

function buildPeriodLabel(
  filters: { from: string; to: string; project_id: string; source: string },
  projects: { id: string; name: string }[],
): string {
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "short", year: "numeric",
    });
  const parts: string[] = [`${fmt(filters.from)} al ${fmt(filters.to)}`];
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
    applyFilters, clearFilters, removeFilter,
    fetchAll, fetchFiltered,
    totalMinutes, activeDays, avgMinutesPerDay,
    timerMinutes, topProject, projectSummaries,
    buckets, heatmap,
    uniqueProjects, uniqueTasks,
    INITIAL_FILTERS,
  } = useTimeEntries();

  useEffect(() => {
    fetchAll();
    fetchFiltered(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodLabel = useMemo(
    () => buildPeriodLabel(filters, uniqueProjects),
    [filters, uniqueProjects],
  );

  return (
    <div className="pb-10 space-y-5">
      <SectionHeader
        title="Registro de Tiempo"
        subtitle="Resumen y historial completo de tus entradas de tiempo"
        icon={<Clock className="w-8 h-8 text-violet-600" />}
      />

      {/* global filter */}
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

      {/* active period indicator */}
      <div className="flex items-center gap-2 px-1">
        {loading
          ? <span className="w-2 h-2 rounded-full bg-violet-300 animate-ping" />
          : <span className="w-2 h-2 rounded-full bg-violet-400" />
        }
        <p className="text-xs text-gray-500 font-medium">
          {loading
            ? <span className="text-gray-400 italic">Actualizando…</span>
            : <>Mostrando: <span className="text-gray-700 font-semibold">{periodLabel}</span></>
          }
        </p>
      </div>

      {/* stat cards */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 rounded-2xl z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-7 h-7 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <TimeStatCards
          totalMinutes={totalMinutes}
          activeDays={activeDays}
          avgMinutesPerDay={avgMinutesPerDay}
          topProject={topProject}
          entryCount={entries.length}
          timerMinutes={timerMinutes}
        />
      </div>

      {/* Chart + Breakdown con overlay de loading */}
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
        <div className="lg:col-span-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 rounded-2xl z-10 flex items-center justify-center backdrop-blur-[1px]">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <ProjectBreakdown summaries={projectSummaries} />
        </div>
      </div>

      {/* history */}
      <TimeEntriesTable
        entries={entries}
        filters={filters}
        loading={loading}
        periodLabel={periodLabel}
      />

      {/* separator */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Actividad anual · independiente de los filtros</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* heatmap - last 365 days */}
      <ActivityHeatmap cells={heatmap} />
    </div>
  );
}