import { PieChart } from "lucide-react";
import type { ProjectSummary } from "../_hooks/use_time_entries";

interface Props {
  summaries: ProjectSummary[];
  loading?:  boolean;
}

const PROJECT_COLORS = [
  { bar: "bg-violet-500", text: "text-violet-600" },
  { bar: "bg-blue-500",   text: "text-blue-600"   },
  { bar: "bg-emerald-500",text: "text-emerald-600" },
  { bar: "bg-amber-500",  text: "text-amber-600"   },
  { bar: "bg-rose-500",   text: "text-rose-600"    },
  { bar: "bg-cyan-500",   text: "text-cyan-600"    },
];

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function SkeletonRow() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-32 rounded bg-gray-100 animate-pulse" />
        <div className="h-3.5 w-16 rounded bg-gray-100 animate-pulse" />
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 animate-pulse" />
    </div>
  );
}

export default function ProjectBreakdown({ summaries, loading }: Props) {
  const visible = summaries.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-5">
        <PieChart size={16} className="text-violet-400" />
        Distribución por proyecto
      </h3>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-300">
          <PieChart size={40} className="mb-3 opacity-40" />
          <p className="text-sm text-gray-400">Sin datos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((p, i) => {
            const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
            return (
              <div key={p.project_id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.bar}`} />
                    <span className="text-sm font-medium text-gray-700 truncate">{p.project_name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className={`text-xs font-bold ${color.text}`}>{p.percentage.toFixed(0)}%</span>
                    <span className="text-xs text-gray-400 w-14 text-right">{fmtHours(p.total_minutes)}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${color.bar}`}
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}