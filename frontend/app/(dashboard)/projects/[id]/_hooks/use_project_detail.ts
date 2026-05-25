"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  state: "active" | "completed" | "cancelled";
  contract_type: "hourly" | "fixed_price" | "retainer";
  estimated_budget: number;
  earned: number;
  start_date: string | null;
  deadline: string | null;
  client_id: string | null;
  client_name: string | null;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  days_until_deadline: number | null;
  deadline_alert: "urgent" | "warning" | "soon" | null;
}

interface UseProjectDetailReturn {
  project: ProjectDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjectDetail(id: string): UseProjectDetailReturn {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${id}`);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al cargar el proyecto");
        return;
      }

      setProject(data);
    } catch {
      setError("Error de conexión. Por favor, intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
}
