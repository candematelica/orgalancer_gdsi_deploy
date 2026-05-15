const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  completed: {
    label: "Completado",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
  },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}