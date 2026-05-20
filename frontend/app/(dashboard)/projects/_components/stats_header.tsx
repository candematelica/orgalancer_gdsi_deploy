import { Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { ProjectStats } from "../_hooks/use_projects";

interface StatsHeaderProps {
  stats: ProjectStats | null;
  loading: boolean;
  currency?: string;
}

function formatCurrency(value: number, currency = "€") {
  return `${currency}${value.toLocaleString("es-ES")}`;
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  loading: boolean;
}

function StatCard({ icon, iconBg, label, value, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function StatsHeader({
  stats,
  loading,
  currency = "€",
}: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={<Briefcase className="w-6 h-6 text-violet-600" />}
        iconBg="bg-violet-100"
        label="Proyectos Activos"
        value={stats?.active_count ?? 0}
        loading={loading}
      />
      <StatCard
        icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
        iconBg="bg-emerald-100"
        label="Ingresos Generados"
        value={stats ? formatCurrency(stats.total_earned, currency) : formatCurrency(0, currency)}
        loading={loading}
      />
      <StatCard
        icon={<TrendingUp className="w-6 h-6 text-sky-600" />}
        iconBg="bg-sky-100"
        label="Presupuesto Total"
        value={stats ? formatCurrency(stats.total_budget, currency) : formatCurrency(0, currency)}
        loading={loading}
      />
    </div>
  );
}