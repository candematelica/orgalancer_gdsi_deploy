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

interface Task {
  id: string;
  title: string;
}

interface TimeEntry {
  task_id: string | null;
  duration_minutes: number;
}

interface ChartData {
  name: string;
  hours: number;
}

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

interface Props {
  projectId: string;
}

export default function TimeByTaskChart({ projectId }: Props) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        const [entriesRes, tasksRes] = await Promise.all([
          fetch(`/api/time-entries?project_id=${projectId}`),
          fetch(`/api/tasks?project_id=${projectId}`),
        ]);

        if (!entriesRes.ok || !tasksRes.ok) return;

        const entries: TimeEntry[] = await entriesRes.json();
        const tasks: Task[] = await tasksRes.json();

        const taskMap: Record<string, string> = {};
        for (const task of tasks) {
          taskMap[task.id] = task.title;
        }

        const grouped: Record<string, number> = {};
        for (const entry of entries) {
          if (!entry.task_id) continue;
          grouped[entry.task_id] = (grouped[entry.task_id] || 0) + entry.duration_minutes;
        }

        const result: ChartData[] = Object.entries(grouped)
          .filter(([taskId]) => taskMap[taskId])
          .map(([taskId, minutes]) => ({
            name: taskMap[taskId],
            hours: Math.round((minutes / 60) * 10) / 10,
          }));

        setData(result);
      } catch (err) {
        console.error("Error fetching time by task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch_data();
  }, [projectId]);

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
        <h2 className="text-base font-semibold text-gray-800 mb-2">Tiempo por tarea</h2>
        <p className="text-sm text-gray-400">No hay registros de tiempo para este proyecto.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Tiempo por tarea</h2>
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
          <Tooltip formatter={(value) => [`${value}h`, "Horas"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend formatter={(value) => <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}