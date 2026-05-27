"use client";

import { createPortal } from "react-dom";
import { Pencil, Trash2, Clock, X, Save } from "lucide-react";
import { useTimeHistory } from "../_hooks/use_time_history";

interface TimeHistoryProps {
  taskId:      string;
  refreshKey?: number;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function TimeHistory({ taskId, refreshKey }: TimeHistoryProps) {
  const {
    entries, total, loading, mounted,
    deleteId, requestDelete, cancelDelete, confirmDelete,
    editEntry, editHours, editMins, editDesc, editDate, saving,
    openEdit, closeEdit, saveEdit,
    setEditHours, setEditMins, setEditDesc, setEditDate,
  } = useTimeHistory(taskId, refreshKey);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Resumen */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total registrado</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatDuration(total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Registros</p>
            <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
          </div>
        </div>

        {/* Lista */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No hay registros de tiempo todavía</p>
            <p className="text-xs text-gray-300 mt-1">Usá el timer o el registro manual para empezar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id}
                className="bg-white border border-purple-100 rounded-xl px-4 py-3 flex items-center gap-3 group hover:shadow-sm transition-shadow"
              >
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  entry.source === "timer" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {entry.source === "timer" ? "Timer" : "Manual"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(entry.entry_date + "T00:00:00").toLocaleDateString("es-AR", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <span className="font-bold text-purple-600 text-sm flex-shrink-0">
                  {formatDuration(entry.duration_minutes)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(entry)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => requestDelete(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portal: edición */}
      {mounted && editEntry && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Editar entrada</h3>
              <button onClick={closeEdit} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha</label>
                <input type="date" value={editDate} max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Horas</label>
                  <input type="number" min="0" max="23" value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm text-center focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minutos</label>
                  <input type="number" min="0" max="59" value={editMins}
                    onChange={(e) => setEditMins(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm text-center focus:outline-none focus:border-purple-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeEdit} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium disabled:opacity-60">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Portal: confirmación eliminar */}
      {mounted && deleteId && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDelete} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}