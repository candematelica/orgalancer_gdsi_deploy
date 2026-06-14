"use client";

import { useState, useEffect } from "react";
import {
  Clock, MousePointerClick, Timer,
  ChevronLeft, ChevronRight, List, Download,
} from "lucide-react";
import type { TimeEntry, TimeFilters } from "../_hooks/use_time_entries";

interface Props {
  entries:     TimeEntry[];
  filters:     TimeFilters;
  loading:     boolean;
  periodLabel: string;
}

const PAGE_SIZE = 10;

function fmtDuration(min: number): string {
  const m = Number(min);
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function exportCSV(entries: TimeEntry[]) {
  const header = ["Fecha", "Proyecto", "Tarea", "Duración (min)", "Descripción", "Tipo"];
  const rows = entries.map((e) => [
    e.entry_date,
    e.project_name ?? "",
    e.task_name ?? "",
    String(e.duration_minutes),
    e.description ?? "",
    e.source,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `tiempo-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[
        "w-24", "w-28", "w-20", "w-14", "w-40", "w-16",
      ].map((w, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className={`h-4 ${w} rounded-md bg-gray-100 animate-pulse`} />
        </td>
      ))}
    </tr>
  );
}

export default function TimeEntriesTable({ entries, filters, loading, periodLabel }: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [entries]);

  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const paginated = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <List size={15} className="text-violet-400" />
            Historial de entradas
          </h3>
          {loading
            ? <div className="h-3 w-48 mt-1.5 rounded bg-gray-100 animate-pulse" />
            : <p className="text-xs text-gray-400 mt-0.5">{periodLabel} · {entries.length} resultado{entries.length !== 1 ? "s" : ""}</p>
          }
        </div>
        {!loading && entries.length > 0 && (
          <button
            onClick={() => exportCSV(entries)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors"
          >
            <Download size={13} />
            Exportar CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Fecha", "Proyecto", "Tarea", "Duración", "Descripción", "Tipo"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center text-gray-300">
                    <Clock size={40} className="mb-3 opacity-30" />
                    <p className="font-semibold text-sm text-gray-400">Sin entradas para estos filtros</p>
                    <p className="text-xs text-gray-300 mt-1">Probá cambiando el rango de fechas o quitando algún filtro</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-violet-50/20 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-700 whitespace-nowrap">
                    {fmtDate(e.entry_date)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {e.project_name ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {e.task_name ?? <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                      <Clock size={10} />
                      {fmtDuration(e.duration_minutes)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[240px] truncate">
                    {e.description ?? <span className="italic text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {e.source === "timer" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        <Timer size={11} /> Timer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <MousePointerClick size={11} /> Manual
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pageCount > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, entries.length)} de {entries.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === pageCount || Math.abs(n - page) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`el-${i}`} className="px-1 text-gray-300 text-xs">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === n ? "bg-violet-600 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}