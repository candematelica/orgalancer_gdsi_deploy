import { Clock, AlertTriangle } from "lucide-react";

interface DeadlineChipProps {
  deadlineStr: string | null;
  daysUntil: number | null;
  alert: "urgent" | "warning" | "soon" | null;
}

export default function DeadlineChip({
  deadlineStr,
  daysUntil,
  alert,
}: DeadlineChipProps) {
  if (!deadlineStr) return null;

  const isOverdue = daysUntil !== null && daysUntil < 0;

  const chipStyles = isOverdue
    ? "text-red-600 bg-red-50"
    : alert === "urgent"
    ? "text-red-600 bg-red-50"
    : alert === "warning"
    ? "text-amber-600 bg-amber-50"
    : alert === "soon"
    ? "text-yellow-600 bg-yellow-50"
    : "text-gray-500 bg-transparent";

  const Icon = alert === "urgent" || isOverdue ? AlertTriangle : Clock;

  const label = isOverdue
    ? "Vencido"
    : daysUntil === 0
    ? "Vence hoy"
    : daysUntil === 1
    ? "Vence mañana"
    : daysUntil !== null && daysUntil <= 14
    ? `${daysUntil}d restantes`
    : null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <Icon className={`w-3.5 h-3.5 ${alert || isOverdue ? chipStyles.split(" ")[0] : "text-gray-400"}`} />
      <span>
        {formatDate(deadlineStr)}
        {label && (
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${chipStyles}`}>
            {label}
          </span>
        )}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}