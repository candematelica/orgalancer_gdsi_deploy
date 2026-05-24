"use client";

// Badge for receipt status. Simple mapping of status to label and colors.

import type { ReceiptStatus } from "../types";

interface Config { label: string; cls: string; dot: string }

export const STATUS_CONFIG: Record<ReceiptStatus, Config> = {
  pending:   { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  paid:      { label: "Cobrado",   cls: "bg-green-100  text-green-700",  dot: "bg-green-500"  },
  cancelled: { label: "Cancelado", cls: "bg-gray-100   text-gray-500",   dot: "bg-gray-400"   },
};

interface Props {
  status:   ReceiptStatus;
  withDot?: boolean;
}

export default function ReceiptStatusBadge({ status, withDot = false }: Props) {
  const { label, cls, dot } = STATUS_CONFIG[status];

  if (withDot) {
    return (
      <div className="flex items-center gap-1.5 w-fit bg-white/20 rounded-full px-3 py-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-xs font-medium text-white">{label}</span>
      </div>
    );
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cls}`}>
      {label}
    </span>
  );
}