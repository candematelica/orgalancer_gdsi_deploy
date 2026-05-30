"use client";

import { Calendar, Save, AlertCircle } from "lucide-react";
import { useManualEntry } from "../_hooks/use_manual_entry";

interface ManualEntryProps {
  fixedProjectId: string;
  fixedTaskId:    string;
  onSaved?:       (durationMinutes: number) => void;
}

export default function ManualEntry({ fixedProjectId, fixedTaskId, onSaved }: ManualEntryProps) {
  const {
    today, date, setDate,
    hours, setHours,
    minutes, setMinutes,
    desc, setDesc,
    error, loading,
    totalMinutes, showPreview,
    handleSubmit,
  } = useManualEntry({ fixedProjectId, fixedTaskId, onSaved });

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Registrar tiempo manualmente</h3>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input type="date" value={date} max={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Duración *</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input type="number" min="0" max="23" value={hours} placeholder="0"
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400 transition-colors text-center" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">hs</span>
            </div>
            <div className="relative">
              <input type="number" min="0" max="59" step="15" value={minutes} placeholder="0"
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-400 transition-colors text-center" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">min</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción *</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
            rows={3} placeholder="Describí qué trabajo realizaste..."
            className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl text-sm bg-white resize-none focus:outline-none focus:border-purple-400 transition-colors" />
        </div>
      </div>

      {showPreview && (
        <div className="bg-white border border-purple-200 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total a registrar</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {(totalMinutes / 60).toFixed(2)} horas
          </p>
          {date && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(date + "T00:00:00").toLocaleDateString("es-AR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.01] transition-all shadow disabled:opacity-60">
        <Save className="w-4 h-4" />
        {loading ? "Guardando…" : "Guardar registro"}
      </button>
    </div>
  );
}