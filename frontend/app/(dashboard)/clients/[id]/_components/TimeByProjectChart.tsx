"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Project {
  id: string;
  name: string;
}

interface TimeEntry {
  project_id: string;
  duration_minutes: number;
}

interface ChartData {
  name: string;
  hours: number;
}

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

interface Props {
  clientId: string;
}

export default function TimeByProjectChart({ clientId }: Props) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const projectsRes = await fetch(`/api/projects?client_id=${clientId}`);
        if (!projectsRes.ok) return;
        const projects: Project[] = await projectsRes.json();

        if (projects.length === 0) {
          setData([]);
          return;
        }

        const results: ChartData[] = [];

        for (const project of projects) {
          const entriesRes = await fetch(`/api/time-entries?project_id=${project.id}`);
          if (!entriesRes.ok) continue;
          const entries: TimeEntry[] = await entriesRes.json();
          const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
          if (totalMinutes > 0) {
            results.push({
              name: project.name,
              hours: Math.round((totalMinutes / 60) * 10) / 10,
            });
          }
        }

        setData(results);
      } catch (err) {
        console.error("Error fetching time by project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch_data();
  }, [clientId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-100 rounded mb-6" />
        <div className="h-48 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Tiempo por proyecto</h2>
        <p className="text-sm text-gray-400">No hay registros de tiempo para este cliente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Tiempo por proyecto</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="hours"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, hours }: { name?: string; hours?: number }) => `${name} (${hours}h)`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}h`, "Horas"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend formatter={(value) => <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}