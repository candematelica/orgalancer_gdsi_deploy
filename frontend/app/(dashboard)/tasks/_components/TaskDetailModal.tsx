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
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
}

const STATUSES = ["Pendiente", "En Progreso", "Bloqueada", "Completada"] as const;
const PRIORITIES = ["Baja", "Media", "Alta", "Urgente"] as const;

export default function TaskDetailModal({ task, onClose, onDelete, onStatusChange, onPriorityChange }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [currentPriority, setCurrentPriority] = useState(task.priority);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || updatingStatus) return;
    const prev = currentStatus;
    setCurrentStatus(newStatus);
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(task.id, newStatus);
    } catch {
      setCurrentStatus(prev);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (newPriority === currentPriority || updatingPriority) return;
    const prev = currentPriority;
    setCurrentPriority(newPriority);
    setUpdatingPriority(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${task.id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (!res.ok) throw new Error();
      onPriorityChange(task.id, newPriority);
    } catch {
      setCurrentPriority(prev);
    } finally {
      setUpdatingPriority(false);
    }
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
    "Bloqueada": "text-orange-700 bg-orange-100",
    "Completada": "text-green-700 bg-green-100",
  };

  const statusButtonColors: Record<string, string> = {
    "Pendiente": "border-gray-400 bg-gray-100 text-gray-700",
    "En Progreso": "border-yellow-400 bg-yellow-100 text-yellow-700",
    "Bloqueada": "border-orange-400 bg-orange-100 text-orange-700",
    "Completada": "border-green-400 bg-green-100 text-green-700",
  };

  const priorityButtonColors: Record<string, string> = {
    Baja: "border-green-300 bg-green-50 text-green-700",
    Media: "border-yellow-300 bg-yellow-50 text-yellow-700",
    Alta: "border-red-300 bg-red-50 text-red-700",
    Urgente: "border-red-400 bg-red-100 text-red-800",
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
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
                {currentStatus}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[currentPriority]}`}>
                {currentPriority}
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

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Estado</h3>
            <div className="grid grid-cols-4 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border-2 transition-all text-center ${
                    currentStatus === s
                      ? statusButtonColors[s]
                      : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Prioridad</h3>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => handlePriorityChange(p)}
                  disabled={updatingPriority}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border-2 transition-all text-center ${
                    currentPriority === p
                      ? priorityButtonColors[p]
                      : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
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