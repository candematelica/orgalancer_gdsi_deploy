"use client";

import { useState, useEffect } from "react";

export interface ClientProject {
  id: string;
  name: string;
  state: string;
  budget: number | null;
  currency: string;
  created_at: string;
}

export function useClientProjects(clientId: string) {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?client_id=${clientId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [clientId]);

  return { projects, loading };
}