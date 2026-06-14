"use client";

import { useState, useEffect } from "react";

interface ClientStats {
  activeProjects: number;
  totalRevenue: number;
}

export function useClientStats(clientIds: string[]) {
  const [stats, setStats] = useState<Record<string, ClientStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      const results = await Promise.all(
        clientIds.map(async (id) => {
          const [projectsRes, revenueRes] = await Promise.all([
            fetch(`/api/projects?client_id=${id}&state=active`),
            fetch(`/api/revenue?client_id=${id}`),
          ]);

          const projects = projectsRes.ok ? await projectsRes.json() : [];
          const revenue  = revenueRes.ok  ? await revenueRes.json()  : [];

          const totalRevenue = (revenue as { amount: number }[]).reduce(
            (sum, r) => sum + r.amount, 0
          );

          return {
            id,
            stats: {
              activeProjects: Array.isArray(projects) ? projects.length : 0,
              totalRevenue: Math.round(totalRevenue * 100) / 100,
            },
          };
        })
      );

      const map: Record<string, ClientStats> = {};
      for (const { id, stats } of results) {
        map[id] = stats;
      }
      setStats(map);
      setLoading(false);
    };

    fetchAll();
  }, [clientIds.join(",")]);

  return { stats, loading };
}