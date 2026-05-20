"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  state: "active" | "completed" | "cancelled";
  contract_type: "hourly" | "fixed_price" | "retainer"; 
  estimated_budget: number;
  earned: number;
  start_date: string | null;
  deadline: string | null;
  client_id: string | null;
  client_name: string | null;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  days_until_deadline: number | null;
  deadline_alert: "urgent" | "warning" | "soon" | null;
}

export interface ProjectStats {
  active_count: number;
  total_earned: number;
  total_budget: number;
}

// ── Deadline alert calculation (Client fallback) ──────────────────────────────
export function computeDeadlineAlert(
  deadlineStr: string | null
): { days: number | null; alert: "urgent" | "warning" | "soon" | null } {
  if (!deadlineStr) return { days: null, alert: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const days = Math.round(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return { days, alert: null };
  if (days <= 3) return { days, alert: "urgent" };
  if (days <= 7) return { days, alert: "warning" };
  if (days <= 14) return { days, alert: "soon" };
  return { days, alert: null };
}

// ── Progress calculation (Client fallback) ────────────────────────────────────
export function computeProgress(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ── Enriched project ─────────────────────────────────────────────────────────
export type EnrichedProject = ProjectListItem & {
  _computed_progress: number;
  _computed_days: number | null;
  _computed_alert: "urgent" | "warning" | "soon" | null;
};

function enrich(project: ProjectListItem): EnrichedProject {
  const { days, alert } = computeDeadlineAlert(project.deadline);
  return {
    ...project,
    _computed_progress: project.progress_percentage ?? computeProgress(project.total_tasks, project.completed_tasks),
    _computed_days: project.days_until_deadline ?? days,
    _computed_alert: project.deadline_alert ?? alert,
  };
}

export type FilterTab = "all" | "active" | "completed" | "cancelled";

export const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "completed", label: "Completados" },
  { key: "cancelled", label: "Cancelados" },
];

export type ViewMode = "grid" | "list";

async function fetchProjects(
  token: string,
  state?: string
): Promise<ProjectListItem[]> {
  const url = new URL("/api/projects", window.location.origin);
  if (state) url.searchParams.set("state", state);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener los proyectos");
  return data;
}

async function fetchProjectStats(token: string): Promise<ProjectStats> {
  const url = new URL("/api/projects/stats", window.location.origin);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener estadísticas");
  return data;
}

export function useProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<EnrichedProject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const getToken = (): string | null => localStorage.getItem("token");

  const loadProjects = useCallback(
    async (filter: FilterTab = activeFilter) => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const stateParam = filter === "all" ? undefined : filter;
        const raw = await fetchProjects(token, stateParam);
        setProjects(raw.map(enrich));
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los proyectos"
        );
      } finally {
        setLoading(false);
      }
    },
    [activeFilter, router]
  );

  const loadStats = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setStatsLoading(true);
    try {
      const s = await fetchProjectStats(token);
      setStats(s);
    } catch {
      // silent fail(?)
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [])
;
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleFilterChange = (filter: FilterTab) => {
    setActiveFilter(filter);
    loadProjects(filter);
  };

  return {
    state: {
      projects,
      stats,
      loading,
      statsLoading,
      error,
      activeFilter,
      viewMode,
    },
    actions: {
      handleFilterChange,
      setViewMode,
      reload: loadProjects,
      reloadStats: loadStats,
    },
  };
}