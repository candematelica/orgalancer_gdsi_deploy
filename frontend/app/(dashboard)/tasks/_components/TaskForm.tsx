"use client";

import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
}

interface TaskFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
}

export default function TaskForm({ onSuccess, onError, onClose }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/projects?state=active", {
          headers: { "Authorization": `Bearer ${token}` },
        });

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

    fetchProjects();
  }, []);

  const validate = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectId = formData.get("project_id") as string;
    const priority = formData.get("priority") as string;
    const targetDateStr = formData.get("target_date") as string;

    if (!title?.trim()) {
      newErrors.title = "El título es requerido.";
    } else if (title.trim().length > 100) {
      newErrors.title = "El título no puede exceder 100 caracteres.";
    }

    if (!description?.trim()) {
      newErrors.description = "La descripción es requerida.";
    }

    if (!projectId?.trim()) {
      newErrors.project_id = "El proyecto es requerido.";
    }

    if (!priority?.trim()) {
      newErrors.priority = "La prioridad es requerida.";
    }

    if (!targetDateStr?.trim()) {
      newErrors.target_date = "La fecha objetivo es requerida.";
    } else {
      const targetDate = new Date(targetDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const targetDateLocal = new Date(targetDate.getTime() + targetDate.getTimezoneOffset() * 60000);

      if (targetDateLocal < today) {
        newErrors.target_date = "La fecha no puede estar en el pasado.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!validate(formData)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.get("title"),
        description: formData.get("description"),
        project_id: formData.get("project_id"),
        priority: formData.get("priority"),
        target_date: formData.get("target_date"),
      };

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No estás autenticado");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al crear la tarea");
      }

      onSuccess();

    } catch (err: any) {
      onError(err.message || "Error desconocido");

    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

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
          className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
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
          className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe los detalles de la tarea..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Proyecto Asignado <span className="text-red-500">*</span>
          </label>
          <select
            id="project_id"
            name="project_id"
            disabled={loadingProjects}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400 ${errors.project_id ? 'border-red-500' : 'border-gray-300'}`}
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
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors bg-white ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecciona la prioridad...</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
          {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
        </div>

        <div>
          <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Objetivo <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            min={today}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors ${errors.target_date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.target_date && <p className="text-red-500 text-xs mt-1">{errors.target_date}</p>}
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading || (projects.length === 0 && !loadingProjects)}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
