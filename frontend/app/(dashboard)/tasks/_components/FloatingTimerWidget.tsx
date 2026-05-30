"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown, PenLine } from "lucide-react";
import LiveTimer from "./LiveTimer";
import ManualEntry from "./ManualEntry";

interface FloatingTimerWidgetProps {
  task: {
    id:         string;
    title:      string;
    project_id: string;
  } | null;
  onClose:       () => void;
  onTaskChange?: () => void;
  onTimeSaved?:  () => void;
}

export default function FloatingTimerWidget({
  task,
  onClose,
  onTaskChange,
  onTimeSaved,
}: FloatingTimerWidgetProps) {
  const [expanded,   setExpanded]   = useState(true);
  const [showManual, setShowManual] = useState(false);

  if (!task) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-40 bg-white rounded-2xl shadow-2xl border border-purple-200
      flex flex-col overflow-hidden transition-all duration-300
      ${showManual ? "w-[900px] max-h-[700px]" : "w-[500px] max-h-[560px]"}
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-100 font-medium">Registrando tiempo</p>
          <p className="text-sm font-semibold text-white truncate">{task.title}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <button onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-6 py-4 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className={`grid gap-6 ${showManual ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Timer en Vivo</h3>
              <LiveTimer
                projectId={task.project_id}
                taskId={task.id}
                onTimeSaved={() => onTimeSaved?.()}
              />
            </div>
            {showManual && (
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Registro Manual</h3>
                <ManualEntry
                  fixedProjectId={task.project_id}
                  fixedTaskId={task.id}
                  onSaved={() => onTimeSaved?.()}
                />
              </div>
            )}
          </div>

          <button onClick={() => setShowManual((prev) => !prev)}
            className="self-start flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
            <PenLine className="w-3.5 h-3.5" />
            {showManual ? "Ocultar registro manual" : "Registrar manualmente"}
          </button>
        </div>
      )}

      {!expanded && (
        <div className="px-6 py-3 text-center text-sm text-gray-600">
          Haz clic arriba para expandir
        </div>
      )}
    </div>
  );
}