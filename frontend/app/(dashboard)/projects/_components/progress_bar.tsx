interface ProgressBarProps {
  percentage: number;
  alert?: "urgent" | "warning" | "soon" | null;
  showLabel?: boolean;
  className?: string;
}

const ALERT_COLORS: Record<string, string> = {
  urgent: "bg-red-500",
  warning: "bg-amber-400",
  soon: "bg-yellow-400",
};

export default function ProgressBar({
  percentage,
  alert,
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const barColor = alert ? ALERT_COLORS[alert] : "bg-violet-500";

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progreso</span>
          <span
            className={`text-xs font-semibold ${
              alert === "urgent"
                ? "text-red-500"
                : alert === "warning"
                ? "text-amber-500"
                : "text-violet-600"
            }`}
          >
            {clamped}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}