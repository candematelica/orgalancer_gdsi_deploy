"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import type { HeatmapCell } from "../_hooks/use_time_entries";

interface Props {
  cells: HeatmapCell[];
}

const LEVEL_CLS: Record<number, string> = {
  0: "bg-gray-100",
  1: "bg-violet-200",
  2: "bg-violet-400",
  3: "bg-violet-600",
  4: "bg-violet-800",
};

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function ActivityHeatmap({ cells }: Props) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // pad cells so the first cell aligns to its correct weekday column (Mon=0)
  const { weeks, monthLabels } = useMemo(() => {
    if (cells.length === 0) return { weeks: [], monthLabels: [] };

    // pad start to align first day to its weekday
    const first = new Date(cells[0].date + "T00:00:00");
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1; // Mon=0
    const padded: (HeatmapCell | null)[] = [
      ...Array(startDay).fill(null),
      ...cells,
    ];

    // chunk into weeks of 7
    const wks: (HeatmapCell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      wks.push(padded.slice(i, i + 7));
    }

    // month labels: find week index where a new month starts
    const labels: { weekIdx: number; label: string }[] = [];
    let lastMonth = -1;
    wks.forEach((wk, wi) => {
      const firstReal = wk.find(Boolean);
      if (!firstReal) return;
      const d = new Date(firstReal.date + "T00:00:00");
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        labels.push({
          weekIdx: wi,
          label: d.toLocaleDateString("es-AR", { month: "short" }),
        });
      }
    });

    return { weeks: wks, monthLabels: labels };
  }, [cells]);

  const activeDays = cells.filter((c) => c.level > 0).length;
  const totalMin   = cells.reduce((s, c) => s + c.minutes, 0);

  const handleMouseEnter = (cell: HeatmapCell, e: React.MouseEvent) => {
    setHovered(cell);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Activity size={15} className="text-violet-400" />
          Actividad — últimos 12 meses
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
          <span>{activeDays} días activos</span>
          <span className="text-gray-200">|</span>
          <span>{fmtMin(totalMin)} totales</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* month labels row */}
          <div className="flex gap-1 mb-0.5 ml-6">
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find((m) => m.weekIdx === wi);
              return (
                <div key={wi} className="w-3 text-[9px] text-gray-400 font-medium">
                  {lbl ? lbl.label : ""}
                </div>
              );
            })}
          </div>

          {/* day rows */}
          <div className="flex gap-1">
            {/* day-of-week labels */}
            <div className="flex flex-col gap-1 mr-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="w-4 h-3 text-[9px] text-gray-400 font-medium flex items-center justify-end pr-0.5">
                  {d}
                </div>
              ))}
            </div>

            {/* grid columns (weeks) */}
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = wk[di] ?? null;
                  return (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-sm transition-all duration-150 ${
                        cell ? `${LEVEL_CLS[cell.level]} cursor-pointer hover:ring-2 hover:ring-violet-400 hover:ring-offset-1` : "bg-transparent"
                      }`}
                      onMouseEnter={cell ? (e) => handleMouseEnter(cell, e) : undefined}
                      onMouseLeave={() => setHovered(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-gray-400">Menos</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`w-3 h-3 rounded-sm ${LEVEL_CLS[l]}`} />
        ))}
        <span className="text-[10px] text-gray-400">Más</span>
      </div>

      {/* tooltip (fixed to cursor) */}
      {hovered && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl leading-relaxed"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 48 }}
        >
          <p className="font-semibold capitalize">{fmtDate(hovered.date)}</p>
          <p className="text-gray-300">
            {hovered.minutes > 0 ? fmtMin(hovered.minutes) + " registrados" : "Sin actividad"}
          </p>
        </div>
      )}
    </div>
  );
}
