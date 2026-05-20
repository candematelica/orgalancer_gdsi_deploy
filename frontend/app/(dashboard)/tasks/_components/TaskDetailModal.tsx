"use client";

import { useEffect, useState } from "react";
import { Calendar, FolderOpen, Clock, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  target_date: string;
  project_id: string;
  project_name: string | null;
  status: string;
}

interface Props {
  task: Task;
  onClose: () => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailModal({ task, onClose, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro que deseas eliminar esta tarea? Esta acción no se puede deshacer.")) return;

    setIsDeleting(true);
    await onDelete(task.id);
    setIsDeleting(false);
  };

  const priorityColors: Record<string, string> = {
    Baja: "bg-green-100 text-green-700",
    Media: "bg-yellow-100 text-yellow-700",
    Alta: "bg-red-100 text-red-700",
    Urgente: "bg-red-200 text-red-800",
  };

  const statusColors: Record<string, string> = {
    "Pendiente": "text-gray-500 bg-gray-100",
    "En Progreso": "text-yellow-700 bg-yellow-100",
    "Completada": "text-green-700 bg-green-100",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                {task.status}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight pr-4">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors self-start mt-1"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 flex-1">
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Descripción
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Fecha Objetivo</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{task.target_date}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FolderOpen className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Proyecto Asignado</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{task.project_name || "Sin proyecto"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
          <button
            onClick={() => console.log("Implementar")}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
