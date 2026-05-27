"use client";

import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import ManualEntry from "../../tasks/_components/ManualEntry";

interface FloatingProjectTimerProps {
  project: {
    id: string;
    name: string;
  } | null;
  onClose: () => void;
  onTimeSaved?: () => void;
}

export default function FloatingProjectTimer({
  project,
  onClose,
  onTimeSaved,
}: FloatingProjectTimerProps) {
  const [expanded, setExpanded] = useState(true);

  if (!project) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 bg-white rounded-2xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-100 font-medium">Registrar tiempo en proyecto</p>
          <p className="text-sm font-semibold text-white truncate">{project.name}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 py-4 overflow-y-auto flex-1">
          <ManualEntry
            fixedProjectId={project.id}
            fixedTaskId=""
            onSaved={() => {
              onTimeSaved?.();
            }}
          />
        </div>
      )}

      {/* Collapsed state */}
      {!expanded && (
        <div className="px-6 py-3 text-center text-sm text-gray-600">
          Haz clic arriba para expandir
        </div>
      )}
    </div>
  );
}
