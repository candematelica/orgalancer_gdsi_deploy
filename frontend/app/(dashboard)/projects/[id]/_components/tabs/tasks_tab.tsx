"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertOctagon, Clock, CheckCircle, Circle, Calendar, ChevronDown } from "lucide-react";
import TaskModal from "@/app/(dashboard)/tasks/_components/TaskModal";
import TaskForm from "@/app/(dashboard)/tasks/_components/TaskForm";
import TaskDetailModal from "@/app/(dashboard)/tasks/_components/TaskDetailModal";
import { useTimerContext } from "@/app/(dashboard)/_lib/TimerContext";

interface TagItem { id: string; name: string }

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  target_date: string;
  project_id: string;
  project_name: string | null;
  status: string;
  tags: TagItem[];
}

const STATUSES = ["Pendiente", "En Progreso", "Completada", "Bloqueada"];

const priorityColors: Record<string, string> = {
  Baja:    "bg-green-100 text-green-700",
  Media:   "bg-yellow-100 text-yellow-700",
  Alta:    "bg-red-100 text-red-700",
  Urgente: "bg-red-200 text-red-800",
};

interface Props {
  projectId: string;
  onTaskChange: () => void;
}

export default function TasksTab({ projectId, onTaskChange }: Props) {
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [taskToEdit, setTaskToEdit]     = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toast, setToast]               = useState<string | null>(null);

  const { setTask: setTimerTask, setIsOpen: setTimerOpen } = useTimerContext();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?project_id=${projectId}`);
      if (res.ok) setTasks(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSuccess = (isEdit: boolean) => {
    setModalOpen(false);
    setTaskToEdit(null);
    showToast(isEdit ? "Tarea actualizada" : "Tarea creada");
    load();
    onTaskChange();
  };

  const handleStatusChange = async (task: Task, nextStatus: string) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    await fetch(`/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    onTaskChange();
  };

  const handleDelete = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setSelectedTask(null);
    showToast("Tarea eliminada");
    load();
    onTaskChange();
  };

  const openEdit = (task: Task) => {
    setSelectedTask(null);
    setTaskToEdit(task);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Tareas</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "Cargando..." : `${tasks.length} tarea${tasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { setTaskToEdit(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusIcon /> Nueva Tarea
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
            <Circle className="text-violet-400" size={20} />
          </div>
          <p className="text-sm text-gray-400">Todavía no hay tareas en este proyecto.</p>
          <button
            onClick={() => { setTaskToEdit(null); setModalOpen(true); }}
            className="text-sm text-violet-600 font-medium hover:underline"
          >
            Crear la primera tarea
          </button>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span title={task.status} className="shrink-0">
                  {task.status === "Completada"  ? <CheckCircle  className="text-green-500"  size={20} /> :
                   task.status === "En Progreso" ? <Clock        className="text-yellow-500" size={20} /> :
                   task.status === "Bloqueada"   ? <AlertOctagon className="text-orange-400" size={20} /> :
                                                   <Circle       className="text-gray-300"   size={20} />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={11} /> {task.target_date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task, e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => { setTimerTask({ id: task.id, title: task.title, project_id: task.project_id }); setTimerOpen(true); }}
                  className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-400 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Registrar tiempo"
                >
                  <Clock size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setTaskToEdit(null); }}>
        <TaskForm
          key={taskToEdit ? taskToEdit.id : `new-${projectId}`}
          taskToEdit={taskToEdit}
          defaultProjectId={projectId}
          onSuccess={handleSuccess}
          onError={msg => showToast(msg)}
          onClose={() => { setModalOpen(false); setTaskToEdit(null); }}
        />
      </TaskModal>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={handleDelete}
          onEdit={openEdit}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-6 py-3 rounded-xl shadow-lg font-medium text-white bg-gray-900">{toast}</div>
        </div>
      )}
    </>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
