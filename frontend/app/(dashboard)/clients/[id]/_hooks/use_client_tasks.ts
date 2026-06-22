"use client";

import { useState, useEffect } from "react";

export interface ClientTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  target_date: string | null;
  project_name?: string;
}

interface Project {
  id: string;
  name: string;
}

export function useClientTasks(clientId: string) {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?client_id=${clientId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(async (projects: Project[]) => {
        if (projects.length === 0) return [];
        const all = await Promise.all(
          projects.map((p) =>
            fetch(`/api/tasks?project_id=${p.id}`)
              .then((r) => r.ok ? r.json() : [])
              .then((ts: ClientTask[]) => ts.map((t) => ({ ...t, project_name: p.name })))
              .catch(() => [])
          )
        );
        return all.flat();
      })
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [clientId]);

  return { tasks, loading };
}