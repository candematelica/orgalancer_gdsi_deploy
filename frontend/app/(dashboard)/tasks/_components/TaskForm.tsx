"use client";

import { useState, useEffect } from "react";
import { Plus, X, Tag } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface TagItem {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: TagItem[];
  target_date: string;
  project_id: string;
  project_name: string | null;
  status: string;
}

interface TaskFormProps {
  taskToEdit?: Task | null;
  defaultProjectId?: string;
  onSuccess: (isEdit: boolean) => void;
  onError: (msg: string) => void;
  onClose: () => void;
}

export default function TaskForm({ taskToEdit, defaultProjectId, onSuccess, onError, onClose }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState(taskToEdit?.status || "Pendiente");
  const [selectedPriority, setSelectedPriority] = useState(taskToEdit?.priority || "Media");
  const [selectedProjectId, setSelectedProjectId] = useState(taskToEdit?.project_id || defaultProjectId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  const PRIORITIES = ["Baja", "Media", "Alta", "Urgente"];
  const STATUSES = ["Pendiente", "En Progreso", "Completada", "Bloqueada"];

  useEffect(() => {
    if (taskToEdit) {
      setSelectedTagIds(taskToEdit.tags.map(tag => tag.id));
    }
  }, [taskToEdit]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects?state=active");

        if (res.ok) {
          const data = await res.json();
          setProjects(data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tasks/tags");
        if (res.ok) setAvailableTags(await res.json());
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchProjects();
    fetchTags();
  }, []);

  const validate = (title: string, description: string, targetDateStr: string) => {
    const newErrors: Record<string, string> = {};

    if (!title?.trim()) {
      newErrors.title = "El título es requerido.";
    } else if (title.trim().length > 100) {
      newErrors.title = "El título no puede exceder 100 caracteres.";
    }

    if (!description?.trim()) {
      newErrors.description = "La descripción es requerida.";
    }

    if (!selectedProjectId?.trim()) {
      newErrors.project_id = "El proyecto es requerido.";
    }

    if (!selectedPriority?.trim()) {
      newErrors.priority = "La prioridad es requerida.";
    }

    if (!targetDateStr?.trim()) {
      newErrors.target_date = "La fecha objetivo es requerida.";
    } else {
      const targetDate = new Date(targetDateStr);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const targetDateLocal = new Date(targetDate.getTime() + targetDate.getTimezoneOffset() * 60000);

      if (!taskToEdit && targetDateLocal < todayDate) {
        newErrors.target_date = "La fecha no puede estar en el pasado.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const target_date = formData.get("target_date") as string;

    if (!validate(title, description, target_date)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        description,
        project_id: selectedProjectId,
        priority: selectedPriority,
        target_date,
        status: selectedStatus,
        tag_ids: selectedTagIds,
      };

      const url = taskToEdit ? `/api/tasks/${taskToEdit.id}` : "/api/tasks";
      const method = taskToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al guardar la tarea");
      }

      onSuccess(!!taskToEdit);

    } catch (err: any) {
      onError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear etiqueta");
      setAvailableTags(prev => [...prev, data]);
      setSelectedTagIds(prev => [...prev, data.id]);
      setNewTagName("");
      setShowTagInput(false);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setCreatingTag(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const today = new Date().toISOString().split('T')[0];

  const priorityStyles: Record<string, string> = {
    Baja: "border-green-300 bg-green-100 text-green-700 focus:ring-green-400",
    Media: "border-yellow-300 bg-yellow-100 text-yellow-700 focus:ring-yellow-400",
    Alta: "border-red-300 bg-red-100 text-red-700 focus:ring-red-400",
    Urgente: "border-red-400 bg-red-200 text-red-800 focus:ring-red-500",
  };

  const statusStyles: Record<string, string> = {
    "Pendiente": "border-gray-300 bg-gray-100 text-gray-700 focus:ring-gray-400",
    "En Progreso": "border-yellow-300 bg-yellow-100 text-yellow-700 focus:ring-yellow-400",
    "Completada": "border-green-300 bg-green-100 text-green-700 focus:ring-green-400",
    "Bloqueada": "border-orange-300 bg-orange-100 text-orange-700 focus:ring-orange-400",
  };

  const baseButtonClasses = "py-2 px-1 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={taskToEdit?.title || ""}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ej: Desarrollo de e-commerce"
          maxLength={100}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={taskToEdit?.description || ""}
          className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe los detalles de la tarea..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Proyecto Asignado <span className="text-red-500">*</span>
          </label>
          <select
            id="project_id"
            name="project_id"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.project_id ? 'border-red-500' : 'border-gray-300'}`}
          >
            {loadingProjects ? (
              <option value="">Cargando proyectos...</option>
            ) : projects.length === 0 ? (
              <option value="">No hay proyectos activos</option>
            ) : (
              <>
                <option value="">Selecciona un proyecto...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </>
            )}
          </select>
          {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id}</p>}
          {!loadingProjects && projects.length === 0 && (
            <p className="text-amber-600 text-xs mt-1">Necesitás crear un proyecto antes de agregar tareas.</p>
          )}
        </div>

        <div>
          <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Objetivo <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            defaultValue={taskToEdit?.target_date || ""}
            min={!taskToEdit ? today : undefined}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 ${errors.target_date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.target_date && <p className="text-red-500 text-xs mt-1">{errors.target_date}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prioridad
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPriority(p)}
              className={`${baseButtonClasses} ${selectedPriority === p
                ? priorityStyles[p]
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
            >
              {p}
            </button>
          ))}
        </div>
        {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStatus(s)}
              className={`${baseButtonClasses} ${selectedStatus === s
                ? statusStyles[s]
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-3.5 h-3.5" />
          Etiquetas
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {availableTags.map(tag => {
            const selected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${selected
                  ? "bg-violet-100 text-violet-700 border-violet-300"
                  : "bg-white text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                  }`}
              >
                {selected && <span className="mr-1">✓</span>}
                {tag.name}
              </button>
            );
          })}
          {!showTagInput && (
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-violet-400 hover:text-violet-600 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Nueva etiqueta
            </button>
          )}
        </div>
        {showTagInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); }
                if (e.key === "Escape") { setShowTagInput(false); setNewTagName(""); }
              }}
              placeholder="Nombre de etiqueta..."
              maxLength={50}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={creatingTag || !newTagName.trim()}
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {creatingTag ? "..." : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => { setShowTagInput(false); setNewTagName(""); }}
              className="p-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading || (projects.length === 0 && !loadingProjects)}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center"
        >
          {loading ? "Guardando..." : (taskToEdit ? "Actualizar" : "Guardar")}
        </button>
      </div>
    </form>
  );
}
