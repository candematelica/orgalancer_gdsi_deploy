import { ProjectDetail } from "../_hooks/use_project_detail";

const STATE_MAP: Record<
  ProjectDetail["state"],
  { label: string; className: string }
> = {
  active:    { label: "En Progreso",  className: "bg-blue-100 text-blue-700"  },
  completed: { label: "Completado",   className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado",    className: "bg-red-100 text-red-700"    },
};

interface Props {
  project: ProjectDetail;
  currency?: string;
}

export default function StatsBar({ project, currency = "$" }: Props) {
  const state = STATE_MAP[project.state];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard label="Estado">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${state.className}`}>
          {state.label}
        </span>
      </StatCard>

      <StatCard label="Progreso">
        <p className="text-2xl font-bold text-violet-600">
          {project.progress_percentage}%
        </p>
      </StatCard>

      <StatCard label="Presupuesto">
        <p className="text-2xl font-bold text-gray-800">
          {currency}{project.estimated_budget.toLocaleString("es-ES")}
        </p>
      </StatCard>

      <StatCard label="Ganado">
        <p className="text-2xl font-bold text-green-600">
          {currency}{project.earned.toLocaleString("es-ES")}
        </p>
      </StatCard>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {children}
    </div>
  );
}