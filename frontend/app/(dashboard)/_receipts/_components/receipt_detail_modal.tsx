"use client";

// Modal to show receipt details. It receives the receipt data as a prop and just renders it, without making any API calls itself.

import { useEffect, useState } from "react";
import type { Receipt, ReceiptStatus } from "../types";

const STATUS_CONFIG: Record<ReceiptStatus, { label: string; dot: string; text: string }> = {
  pending:   { label: "Pendiente", dot: "bg-yellow-400", text: "text-yellow-700" },
  paid:      { label: "Cobrado",   dot: "bg-green-500",  text: "text-green-700"  },
  cancelled: { label: "Cancelado", dot: "bg-gray-400",   text: "text-gray-500"   },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtAmount(n: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const shortId = (id: string) =>
  id.replace(/-/g, "").slice(0, 8).toUpperCase();


interface Props {
  receipt: Receipt | null;
  onClose: () => void;
}

export default function ReceiptDetailModal({ receipt, onClose }: Props) {
  const [issuerName, setIssuerName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setIssuerName(JSON.parse(raw).full_name ?? "");
  }, []);

  if (!receipt) return null;

  const { label, dot } = STATUS_CONFIG[receipt.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-200 text-xs font-medium uppercase tracking-widest mb-1">
                Recibo
              </p>
              <p className="text-white text-xl font-bold font-mono tracking-wider">
                #{shortId(receipt.id)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <XIcon />
            </button>
          </div>

          {/* Status pill */}
          <div className="mt-4 flex items-center gap-1.5 w-fit bg-white/20 rounded-full px-3 py-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <span className="text-xs font-medium text-white">{label}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {issuerName && <Row label="Emitido por" value={issuerName} />}

          <Dash />

          <div className="grid grid-cols-2 gap-4">
            {receipt.client_name  && <Row label="Cliente"  value={receipt.client_name}  />}
            {receipt.project_name && <Row label="Proyecto" value={receipt.project_name} />}
          </div>

          <Dash />

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Concepto</p>
            <p className="text-sm text-gray-800 leading-relaxed">{receipt.concept}</p>
          </div>

          <Dash />

          <div className="flex items-end justify-between">
            <Row label="Fecha de emisión" value={fmtDate(receipt.date_emitted)} />
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900 leading-none">
                {fmtAmount(receipt.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}


function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function Dash() {
  return <hr className="border-dashed border-gray-200" />;
}

function XIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}