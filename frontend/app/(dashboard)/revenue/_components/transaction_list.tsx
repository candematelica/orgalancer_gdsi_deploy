"use client";

import { Pencil, Trash2, FileText } from "lucide-react";

export interface Transaction {
  id: string;
  project_name: string;
  client_name: string;
  client_id?: string | null;
  project_id?: string | null;
  amount: number;
  currency: string;
  payment_type: "monetario" | "canje";
  payment_method: string;
  receipt_id?: string | null;
  date: string;
  description?: string;
}

interface Props {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
  onViewReceipt?: (receiptId: string) => void;
  onDelete?: (id: string) => void;
}

const ICON_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-orange-500",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function TransactionList({ transactions, onEdit, onDelete, onViewReceipt }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No hay transacciones registradas aún.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-gray-800 mb-4">Transacciones Recientes</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {transactions.map((tx, i) => (
          <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
            {/* Icon */}
            <div className={`w-10 h-10 ${ICON_COLORS[i % ICON_COLORS.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="13" rx="2" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12.5" r="2.5" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{tx.project_name}</p>
              <p className="text-xs text-gray-400">{tx.client_name}</p>
              {tx.payment_type === "canje" && tx.description && (
                <p className="text-xs text-violet-500 mt-0.5 truncate">
                  Canje: {tx.description}
                </p>
              )}
            </div>

            {/* Amount + meta */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-green-600">
                {tx.currency}{tx.amount.toLocaleString("es-ES")}
              </p>
              <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
              <p className="text-xs text-gray-400">{tx.payment_method}</p>
            </div>

            {/* Actions */}
            {(onEdit || onDelete || onViewReceipt) && (
              <div className="flex gap-1 flex-shrink-0 ml-2 items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  {tx.receipt_id && onViewReceipt ? (
                    <button
                      onClick={() => onViewReceipt(tx.receipt_id!)}
                      title="Ver recibo asociado"
                      className="p-1.5 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition"
                    >
                      <FileText size={14} />
                    </button>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>

                {onEdit && (
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
