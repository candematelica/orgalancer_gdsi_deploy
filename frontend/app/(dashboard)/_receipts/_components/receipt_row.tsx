"use client";

// Confirm and delete are handled by the parent, which manages the list of receipts and their states.
// This component just renders the row and calls the appropriate callbacks when actions are taken.

import type { Receipt } from "../types";
import ReceiptStatusBadge from "./receipt_status_badge";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtAmount(n: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export interface ReceiptRowProps {
  receipt:          Receipt;
  isDeleting:       boolean;
  confirmingDelete: boolean;
  onView:           () => void;
  onDeleteRequest:  () => void;
  onDeleteConfirm:  () => void;
  onDeleteCancel:   () => void;
}

export default function ReceiptRow({
  receipt, isDeleting, confirmingDelete,
  onView, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
}: ReceiptRowProps) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl hover:border-violet-100 hover:bg-violet-50/30 transition-colors cursor-pointer group"
      onClick={onView}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
        <ReceiptIcon className="text-violet-400" size={16} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-violet-700 transition-colors">
          {receipt.concept}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(receipt.date_emitted)}</p>
      </div>

      {/* Amount */}
      <p className="text-sm font-semibold text-gray-800 shrink-0">
        {fmtAmount(receipt.amount)}
      </p>

      {/* Status */}
      <ReceiptStatusBadge status={receipt.status} />

      {/* Delete */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {!confirmingDelete ? (
          <button
            onClick={onDeleteRequest}
            disabled={isDeleting}
            title="Eliminar recibo"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <TrashIcon />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">¿Eliminar?</span>
            <button
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isDeleting ? "..." : "Sí"}
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceiptIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" className={className}>
      <path d="M4 2h16v22l-3-2-2 2-2-2-2 2-2-2-3 2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}