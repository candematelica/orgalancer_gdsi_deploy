"use client";

export type DeleteModalState = "none" | "confirm" | "warning";

interface Props {
  state: DeleteModalState;
  clientName: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: (action: "cancel" | "complete") => void;
}

export default function DeleteModal({ state, clientName, deleting, onClose, onConfirm }: Props) {
  if (state === "none") return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {state === "confirm" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar cliente?</h2>
          <p className="text-sm text-gray-500 mb-6">
            Estás por eliminar a{" "}
            <span className="font-semibold text-gray-700">{clientName}</span>.
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm("cancel")}
              disabled={deleting}
              className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      )}

      {state === "warning" && (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-amber-500">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Este cliente tiene proyectos activos</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Para eliminar a{" "}
            <span className="font-semibold text-gray-700">{clientName}</span>{" "}
            tenés que decidir qué hacer con sus proyectos activos.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onConfirm("cancel")}
              disabled={deleting}
              className="w-full px-5 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 text-left"
            >
              <span className="block font-bold">Cancelar proyectos y eliminar cliente</span>
              <span className="block text-xs text-red-100 mt-0.5">Los proyectos activos pasarán a estado &quot;cancelado&quot;</span>
            </button>
            <button
              onClick={() => onConfirm("complete")}
              disabled={deleting}
              className="w-full px-5 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 text-left"
            >
              <span className="block font-bold">Finalizar proyectos y eliminar cliente</span>
              <span className="block text-xs text-green-100 mt-0.5">Los proyectos activos pasarán a estado &quot;finalizado&quot;</span>
            </button>
            <button
              onClick={onClose}
              disabled={deleting}
              className="w-full px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar operación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}