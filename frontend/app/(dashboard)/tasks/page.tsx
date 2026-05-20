"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Check, Circle, CheckCircle2, CircleDot, Calendar, User, LayoutList, FolderOpen } from "lucide-react";
import SectionHeader from "./../_components/section_header"
import TaskModal from "./_components/TaskModal";
import TaskForm from "./_components/TaskForm";
import TaskDetailModal from "./_components/TaskDetailModal";

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

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todas");

  const filters = ["Todas", "Pendientes", "En Progreso", "Completadas"];

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/tasks", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      }

    } catch (error) {
      console.error("Error fetching tasks:", error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setToast({ message: "Tarea creada exitosamente", type: "success" });
    setTimeout(() => setToast(null), 3000);
    fetchTasks();
  };

  const handleError = (msg: string) => {
    setToast({ message: msg, type: "error" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusCycle = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();

    const statusOrder = ["Pendiente", "En Progreso", "Completada"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

    } catch (error) {
      console.error("Error updating status:", error);

      fetchTasks();
      handleError("Error al actualizar el estado");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar");
      }

      setToast({ message: "Tarea eliminada exitosamente", type: "success" });
      setTimeout(() => setToast(null), 3000);
      setSelectedTask(null);
      fetchTasks();

    } catch (error: any) {
      handleError(error.message || "Error al eliminar la tarea");
    }
  };

  const priorityColors: Record<string, string> = {
    Baja: "bg-green-100 text-green-700",
    Media: "bg-yellow-100 text-yellow-700",
    Alta: "bg-red-100 text-red-700",
    Urgente: "bg-red-200 text-red-800",
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "Todas") return true;
    if (filter === "Pendientes") return task.status === "Pendiente";
    if (filter === "En Progreso") return task.status === "En Progreso";
    if (filter === "Completadas") return task.status === "Completada";
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <SectionHeader title="Tareas" subtitle="Organiza y prioriza tu trabajo" icon={<Check className="w-8 h-8 text-indigo-600"/>}>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
        >
          <span className="text-lg leading-none">+</span>
          Nueva Tarea
        </button>
      </SectionHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors border ${filter === f
              ? "bg-violet-100 text-violet-700 font-semibold border-transparent shadow-sm"
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-violet-600 shadow-sm"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Cargando tareas...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center mt-6">
          {tasks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-violet-200 rounded-3xl p-12 text-center max-w-md">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutList className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Todavía no tenés tareas</h2>
              <p className="text-sm text-gray-400 mb-6">
                Creá tu primera tarea para empezar a organizar tus proyectos.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                + Nueva tarea
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p>No hay tareas que coincidan con "{filter}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:bg-violet-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 flex-1">
                <button
                  onClick={(e) => handleStatusCycle(task, e)}
                  className="mt-1 flex-shrink-0 hover:scale-110 transition-transform focus:outline-none"
                  title="Cambiar estado"
                >
                  {task.status === "Completada" ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : task.status === "En Progreso" ? (
                    <CircleDot className="text-yellow-500" size={24} />
                  ) : (
                    <Circle className="text-gray-300" size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {task.target_date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate max-w-[160px]">{task.project_name || "Sin proyecto"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center ml-10 sm:ml-0">
                <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TaskForm onSuccess={handleSuccess} onError={handleError} onClose={() => setIsModalOpen(false)} />
      </TaskModal>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className={`px-6 py-3 rounded-xl shadow-lg font-medium text-white ${toast.type === "success" ? "bg-gray-900" : "bg-red-500"}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}