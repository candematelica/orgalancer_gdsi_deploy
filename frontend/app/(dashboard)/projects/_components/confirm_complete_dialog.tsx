"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";

interface ConfirmCompleteDialogProps {
  isOpen: boolean;
  projectName: string;
  pendingTasksCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmCompleteDialog({
  isOpen,
  projectName,
  pendingTasksCount,
  onConfirm,
  onCancel,
}: ConfirmCompleteDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">

          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Tareas pendientes
          </h3>

          {/* Body */}
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-700">{projectName}</span> tiene{" "}
            <span className="font-semibold text-amber-600">
              {pendingTasksCount}{" "}
              {pendingTasksCount === 1 ? "tarea pendiente" : "tareas pendientes"}
            </span>
            .
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Al confirmar el cierre, todas las tareas pendientes pasarán
            automáticamente a{" "}
            <span className="font-medium text-gray-700">completada</span> y el
            proyecto quedará en{" "}
            <span className="font-medium text-gray-700">modo solo lectura</span>.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar cierre
            </button>
          </div>
        </div>
      </div>
    </>
  );
}