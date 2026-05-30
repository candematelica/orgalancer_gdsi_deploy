"use client";

import { Calendar, FolderOpen, Clock, Tag } from "lucide-react";
import TimeHistory from "./TimeHistory";
import { useTaskDetailModal } from "../_hooks/use_task_detail_modal";

interface TagItem {
  id: string;
  name: string;
}

interface Task {
  id:           string;
  title:        string;
  description:  string;
  priority:     string;
  target_date:  string;
  project_id:   string;
  project_name: string | null;
  status:       string;
  tags:         TagItem[];
}

interface Props {
  task: Task;
  onClose: () => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  timeRefreshKey?: number;
}

const statusColors: Record<string, string> = {
  "Pendiente":   "text-gray-600 bg-gray-100 border-gray-200",
  "En Progreso": "text-yellow-700 bg-yellow-100 border-yellow-200",
  "Bloqueada":   "text-orange-700 bg-orange-100 border-orange-200",
  "Completada":  "text-green-700 bg-green-100 border-green-200",
};

const priorityColors: Record<string, string> = {
  Baja:    "text-green-700 bg-green-100 border-green-200",
  Media:   "text-yellow-700 bg-yellow-100 border-yellow-200",
  Alta:    "text-red-700 bg-red-100 border-red-200",
  Urgente: "text-red-800 bg-red-200 border-red-300",
};

export default function TaskDetailModal({ task, onClose, onDelete, onEdit, timeRefreshKey = 0 }: Props) {
  const {
    isDeleting,
    showDeleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDelete,
  } = useTaskDetailModal({ onClose, onDelete, taskId: task.id });

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[task.status]}`}>
                  {task.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityColors[task.priority]}`}>
                  Prioridad {task.priority}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight pr-4">{task.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors self-start mt-1">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-6 flex-1">
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Descripción</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {task.description || "Sin descripción."}
              </p>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-800">Tiempos Registrados</h3>
              </div>
              <TimeHistory taskId={task.id} refreshKey={timeRefreshKey} />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <button
              onClick={openDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
            <button
              onClick={() => onEdit(task)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-2">¿Eliminar tarea?</h3>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium text-gray-700">{task.title}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeDeleteConfirm} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}