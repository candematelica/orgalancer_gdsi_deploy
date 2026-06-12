import { Clock, TrendingUp, Layers, CalendarCheck, Timer, Info } from "lucide-react";
import type { ProjectSummary } from "../_hooks/use_time_entries";

interface Props {
  totalMinutes:     number;
  activeDays:       number;
  avgMinutesPerDay: number;
  topProject:       ProjectSummary | null;
  entryCount:       number;
  timerMinutes:     number;
}

function fmtH(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface CardProps {
  iconBg:  string;
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
  tooltip?: string;
  accent?: string;
}

function StatCard({ iconBg, icon, label, value, sub, tooltip, accent }: CardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:bg-violet-50/20 transition-all group overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accent ?? "bg-violet-400"}`} />
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
          {tooltip && (
            <span className="group/tip relative">
              <Info size={11} className="text-gray-300 hover:text-gray-500 cursor-help shrink-0" />
              <span className="pointer-events-none absolute left-5 -top-1 z-10 hidden group-hover/tip:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 w-52 shadow-lg leading-relaxed">
                {tooltip}
              </span>
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-gray-800 mt-0.5 break-words leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function TimeStatCards({ totalMinutes, activeDays, avgMinutesPerDay, topProject, entryCount, timerMinutes }: Props) {
  const timerPct = totalMinutes > 0 ? Math.round((timerMinutes / totalMinutes) * 100) : 0;
  const manualMinutes = totalMinutes - timerMinutes;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        iconBg="bg-violet-50 text-violet-600"
        icon={<Clock size={20} strokeWidth={2.5} />}
        label="Total registrado"
        value={fmtH(totalMinutes)}
        sub={`${entryCount} entrada${entryCount !== 1 ? "s" : ""} en el período`}
        accent="bg-violet-400"
      />
      <StatCard
        iconBg="bg-blue-50 text-blue-500"
        icon={<CalendarCheck size={20} strokeWidth={2.5} />}
        label="Días trabajados"
        value={`${activeDays} día${activeDays !== 1 ? "s" : ""}`}
        sub={activeDays > 0 ? `${fmtH(avgMinutesPerDay)} promedio por día activo` : "sin actividad"}
        accent="bg-blue-400"
      />
      <StatCard
        iconBg="bg-emerald-50 text-emerald-500"
        icon={<Timer size={20} strokeWidth={2.5} />}
        label="Timer vs Manual"
        value={totalMinutes > 0 ? `${timerPct}% timer` : "—"}
        sub={totalMinutes > 0 ? `${fmtH(timerMinutes)} timer · ${fmtH(manualMinutes)} manual` : "sin datos"}
        tooltip="Timer: tiempo iniciado con el cronómetro. Manual: cargado a mano."
        accent="bg-emerald-400"
      />
      <StatCard
        iconBg="bg-amber-50 text-amber-500"
        icon={<Layers size={20} strokeWidth={2.5} />}
        label="Proyecto líder"
        value={topProject ? topProject.project_name : "—"}
        sub={topProject ? `${fmtH(topProject.total_minutes)} · ${topProject.percentage.toFixed(0)}% del total` : "sin datos"}
        accent="bg-amber-400"
      />
    </div>
  );
}