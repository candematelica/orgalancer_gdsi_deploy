"use client";

import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { useTimer } from "../_hooks/use_timer";

interface Props {
  projectId:     string;
  taskId:        string;
  onTimeSaved?:  (durationMinutes: number) => void;
}

export default function LiveTimer({ projectId, taskId, onTimeSaved }: Props) {
  const {
    status, seconds,
    start, pause, resume, reset,
    formatTime, handleStop,
    saving, error,
    description, setDescription,
  } = useTimer(projectId, taskId, onTimeSaved);

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 text-center">
        <div className={`text-6xl font-bold font-mono tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent transition-opacity ${
          status === "idle" ? "opacity-40" : status === "paused" ? "opacity-60" : "opacity-100"
        }`}>
          {formatTime()}
        </div>
        <p className="text-sm text-gray-500">
          {status === "idle"   ? "Presioná Play para comenzar"
          : status === "paused" ? "Timer en pausa"
          : "Timer en ejecución"}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {status === "idle" && (
            <button onClick={start}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow">
              <Play className="w-4 h-4 fill-white" /> Iniciar
            </button>
          )}
          {status === "running" && (
            <>
              <button onClick={pause}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow">
                <Pause className="w-4 h-4" /> Pausar
              </button>
              <button onClick={handleStop} disabled={saving}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow disabled:opacity-60">
                <Square className="w-4 h-4 fill-white" />
                {saving ? "Guardando…" : "Detener y guardar"}
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button onClick={resume}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow">
                <Play className="w-4 h-4 fill-white" /> Continuar
              </button>
              <button onClick={handleStop} disabled={saving}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all shadow disabled:opacity-60">
                <Square className="w-4 h-4 fill-white" />
                {saving ? "Guardando…" : "Detener y guardar"}
              </button>
            </>
          )}
          {(status === "paused" || status === "idle") && seconds > 0 && (
            <button onClick={reset}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm hover:opacity-90 hover:scale-[1.02] transition-all">
              <RotateCcw className="w-4 h-4" /> Reiniciar
            </button>
          )}
        </div>
      </div>

      {status !== "idle" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿En qué estás trabajando? <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} placeholder="Describe brevemente en qué estás trabajando..."
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm bg-purple-50/30 resize-none focus:outline-none focus:border-purple-400 transition-colors" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-purple-100 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Tiempo en curso</p>
          <p className="text-xl font-bold font-mono text-purple-600">{formatTime()}</p>
        </div>
        <div className="p-4 bg-white border border-purple-100 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Equivale a</p>
          <p className="text-xl font-bold text-purple-600">{(seconds / 3600).toFixed(2)}h</p>
        </div>
      </div>
    </div>
  );
}