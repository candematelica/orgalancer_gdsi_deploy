"use client";

import { Trash2 } from "lucide-react";
import type { Expense } from "../_hooks/use_expenses";

interface Props {
  expense: Expense;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteExpenseDialog({ expense, currency, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-gray-800">Eliminar gasto</h2>
        </div>

        <p className="text-sm text-gray-500 mb-1">
          ¿Confirmás que querés eliminar este gasto?
        </p>
        <p className="text-sm font-semibold text-gray-800 mb-1">
          {expense.category_name ?? "Sin categoría"} — {currency}{expense.amount.toLocaleString("es-ES")}
        </p>
        {expense.description && (
          <p className="text-xs text-gray-400 mb-4">{expense.description}</p>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}