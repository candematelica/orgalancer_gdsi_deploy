import { useState, useCallback, useMemo } from "react";

export interface TimeEntry {
  id: string;
  project_id: string;
  project_name: string | null;
  task_id: string | null;
  task_name: string | null;
  entry_date: string;
  duration_minutes: number;
  description: string | null;
  source: "manual" | "timer";
  created_at: string;
}

export interface TimeFilters {
  project_id: string;
  task_id: string;
  from: string;
  to: string;
  source: string;
}

export interface ProjectSummary {
  project_id: string;
  project_name: string;
  total_minutes: number;
  entry_count: number;
  percentage: number;
}

export interface PeriodBucket {
  label: string;
  key: string;
  minutes: number;
  hours: number;
}

export interface HeatmapCell {
  date: string;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export type PeriodView = "daily" | "weekly" | "monthly";
export type QuickPeriod = "today" | "week" | "month";

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getQuickRange(period: QuickPeriod): { from: string; to: string } {
  const now = new Date();
  const today = toISO(now);
  if (period === "today") return { from: today, to: today };
  if (period === "week") {
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const mon = new Date(now);
    mon.setDate(now.getDate() - day);
    return { from: toISO(mon), to: today };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: toISO(from), to: today };
}

/** Returns which QuickPeriod a given from/to range matches, or null if custom */
export function detectQuickPeriod(from: string, to: string): QuickPeriod | null {
  const periods: QuickPeriod[] = ["today", "week", "month"];
  for (const p of periods) {
    const r = getQuickRange(p);
    if (r.from === from && r.to === to) return p;
  }
  return null;
}

function isoMonday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function fmtWeekLabel(mon: string): string {
  const d = new Date(mon + "T00:00:00");
  const sun = new Date(d);
  sun.setDate(d.getDate() + 6);
  const f = (x: Date) => x.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  return `${f(d)} – ${f(sun)}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMonths(isoYM: string, n: number): string {
  const [y, m] = isoYM.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function allKeysInRange(from: string, to: string, view: PeriodView): string[] {
  const keys: string[] = [];
  if (view === "daily") {
    let cur = from;
    while (cur <= to) { keys.push(cur); cur = addDays(cur, 1); }
  } else if (view === "weekly") {
    let cur = isoMonday(from);
    const toMon = isoMonday(to);
    while (cur <= toMon) { keys.push(cur); cur = addDays(cur, 7); }
  } else {
    let cur = from.slice(0, 7);
    const toYM = to.slice(0, 7);
    while (cur <= toYM) { keys.push(cur); cur = addMonths(cur, 1); }
  }
  return keys;
}

function keyToLabel(key: string, view: PeriodView): string {
  if (view === "daily") {
    return new Date(key + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  }
  if (view === "weekly") return fmtWeekLabel(key);
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

export function buildBuckets(entries: TimeEntry[], view: PeriodView, from: string, to: string): PeriodBucket[] {
  const map = new Map<string, number>();
  entries.forEach((e) => {
    const key =
      view === "daily"  ? e.entry_date :
      view === "weekly" ? isoMonday(e.entry_date) :
      e.entry_date.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + Number(e.duration_minutes));
  });
  return allKeysInRange(from, to, view).map((key) => {
    const minutes = map.get(key) ?? 0;
    return { key, label: keyToLabel(key, view), minutes, hours: Math.round((minutes / 60) * 10) / 10 };
  });
}

export function buildHeatmap(entries: TimeEntry[]): HeatmapCell[] {
  const map = new Map<string, number>();
  entries.forEach((e) => {
    map.set(e.entry_date, (map.get(e.entry_date) ?? 0) + Number(e.duration_minutes));
  });
  const today = new Date();
  const cells: HeatmapCell[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const minutes = map.get(iso) ?? 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if      (minutes <= 0)   level = 0;
    else if (minutes <= 60)  level = 1;
    else if (minutes <= 180) level = 2;
    else if (minutes <= 360) level = 3;
    else                     level = 4;
    cells.push({ date: iso, minutes, level });
  }
  return cells;
}

export function useTimeEntries() {
  const monthRange = getQuickRange("month");
  const INITIAL: TimeFilters = { project_id: "", task_id: "", from: monthRange.from, to: monthRange.to, source: "" };

  const [allEntries, setAllEntries] = useState<TimeEntry[]>([]);
  const [entries, setEntries]       = useState<TimeEntry[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [filters, setFilters]       = useState<TimeFilters>(INITIAL);
  const [periodView, setPeriodView] = useState<PeriodView>("daily");
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod | null>("month");

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/time-entries");
      if (!res.ok) return;
      setAllEntries(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchFiltered = useCallback(async (f: TimeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (f.project_id) qs.set("project_id", f.project_id);
      if (f.task_id)    qs.set("task_id",    f.task_id);
      if (f.from)       qs.set("from",       f.from);
      if (f.to)         qs.set("to",         f.to);
      const res = await fetch(`/api/time-entries?${qs.toString()}`);
      if (!res.ok) throw new Error("Error al cargar las entradas");
      const data: TimeEntry[] = await res.json();
      setEntries(f.source ? data.filter((e) => e.source === f.source) : data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((next: TimeFilters) => {
    setFilters(next);
    // Re-detect quick period after applying — if only project/source/task changed, keep it
    const detected = detectQuickPeriod(next.from, next.to);
    setQuickPeriod(detected);
    fetchFiltered(next);
  }, [fetchFiltered]);

  const applyQuickPeriod = useCallback((period: QuickPeriod) => {
    const range = getQuickRange(period);
    const next: TimeFilters = { ...filters, from: range.from, to: range.to };
    setQuickPeriod(period);
    setFilters(next);
    if (period === "today") setPeriodView("daily");
    if (period === "week")  setPeriodView("daily");
    if (period === "month") setPeriodView("daily");
    fetchFiltered(next);
  }, [filters, fetchFiltered]);

  const clearFilters = useCallback(() => {
    const range = getQuickRange("month");
    const next: TimeFilters = { project_id: "", task_id: "", from: range.from, to: range.to, source: "" };
    setFilters(next);
    setQuickPeriod("month");
    fetchFiltered(next);
  }, [fetchFiltered]);

  const removeFilter = useCallback((key: keyof TimeFilters) => {
    const range = getQuickRange("month");
    const next: TimeFilters = {
      ...filters,
      [key]: key === "from" ? range.from : key === "to" ? range.to : "",
    };
    if (key === "from") { next.from = range.from; next.to = range.to; }
    setFilters(next);
    setQuickPeriod(detectQuickPeriod(next.from, next.to));
    fetchFiltered(next);
  }, [filters, fetchFiltered]);

  const totalMinutes     = useMemo(() => entries.reduce((s, e) => s + Number(e.duration_minutes), 0), [entries]);
  const activeDays       = useMemo(() => new Set(entries.map((e) => e.entry_date)).size, [entries]);
  const avgMinutesPerDay = activeDays > 0 ? totalMinutes / activeDays : 0;
  const timerMinutes     = useMemo(() =>
    entries.filter((e) => e.source === "timer").reduce((s, e) => s + Number(e.duration_minutes), 0),
  [entries]);

  const projectSummaries = useMemo<ProjectSummary[]>(() => {
    const map = new Map<string, ProjectSummary>();
    entries.forEach((e) => {
      const ex = map.get(e.project_id);
      if (ex) { ex.total_minutes += Number(e.duration_minutes); ex.entry_count++; }
      else map.set(e.project_id, {
        project_id: e.project_id,
        project_name: e.project_name ?? "Sin proyecto",
        total_minutes: Number(e.duration_minutes),
        entry_count: 1,
        percentage: 0,
      });
    });
    const list = Array.from(map.values()).sort((a, b) => b.total_minutes - a.total_minutes);
    list.forEach((p) => { p.percentage = totalMinutes > 0 ? (p.total_minutes / totalMinutes) * 100 : 0; });
    return list;
  }, [entries, totalMinutes]);

  const topProject = projectSummaries[0] ?? null;

  const buckets = useMemo(
    () => buildBuckets(entries, periodView, filters.from, filters.to),
    [entries, periodView, filters.from, filters.to]
  );

  const heatmap = useMemo(() => buildHeatmap(allEntries), [allEntries]);

  const uniqueProjects = useMemo(() => {
    const m = new Map<string, string>();
    allEntries.forEach((e) => m.set(e.project_id, e.project_name ?? "Sin proyecto"));
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [allEntries]);

  const uniqueTasks = useMemo(() => {
    const m = new Map<string, string>();
    allEntries.forEach((e) => { if (e.task_id && e.task_name) m.set(e.task_id, e.task_name); });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [allEntries]);

  return {
    entries, allEntries, loading, error,
    filters, setFilters,
    periodView, setPeriodView,
    quickPeriod, applyQuickPeriod,
    applyFilters, clearFilters, removeFilter,
    fetchAll, fetchFiltered,
    totalMinutes, activeDays, avgMinutesPerDay, timerMinutes,
    topProject, projectSummaries,
    buckets, heatmap,
    uniqueProjects, uniqueTasks,
    INITIAL_FILTERS: INITIAL,
  };
}