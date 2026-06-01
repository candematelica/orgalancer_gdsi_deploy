"use client";

import { useEffect, useState, useCallback } from "react";
import { Notification } from "../../_components/notification_dropdown";

const TASK_THRESHOLDS = [0, 1, 2, 3];
const PROJECT_THRESHOLDS = [3, 7, 14];

interface RawTask {
    id: string;
    title: string;
    target_date: string | null;
    status: string;
    project_name?: string | null;
}

interface RawProject {
    id: string;
    name: string;
    deadline: string | null;
    state: "active" | "completed" | "cancelled";
    days_until_deadline: number | null;  // ya viene calculado del backend
}

// Calcula días para tareas (el backend no lo devuelve en /api/tasks/)
function daysUntil(dateStr: string): number {
    const [y, m, d] = dateStr.split("-").map(Number);
    const today = new Date();
    const target = new Date(y, m - 1, d);
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.round((target.getTime() - todayNorm.getTime()) / 86_400_000);
}

function taskNotifications(tasks: RawTask[]): Notification[] {
    const result: Notification[] = [];
    for (const task of tasks) {
        if (!task.target_date) continue;
        if (task.status === "Completada") continue;

        const days = daysUntil(task.target_date);
        if (!TASK_THRESHOLDS.includes(days)) continue;

        const dayLabel = days === 1 ? "mañana" : days === 0 ? "hoy" : `en ${days} días`;

        result.push({
            id: `deadline-task-${task.id}-${days}d`,
            type: "task",
            title: `Tarea próxima a vencer: ${task.title}`,
            description: `La tarea vence ${dayLabel}${task.project_name ? ` · Proyecto: ${task.project_name}` : ""}.`,
            time: "Ahora",
            read: false,
        });
    }
    return result;
}

function projectNotifications(projects: RawProject[]): Notification[] {
    const result: Notification[] = [];
    for (const project of projects) {
        if (!project.deadline) continue;
        if (project.state !== "active") continue;

        // Usar days_until_deadline del backend directamente
        const days = project.days_until_deadline;
        if (days === null || !PROJECT_THRESHOLDS.includes(days)) continue;

        const dayLabel = days === 1 ? "mañana" : days === 0 ? "hoy" : `en ${days} días`;

        result.push({
            id: `deadline-project-${project.id}-${days}d`,
            type: "task",
            title: `Proyecto próximo a vencer: ${project.name}`,
            description: `La fecha límite del proyecto es ${dayLabel}.`,
            time: "Ahora",
            read: false,
        });
    }
    return result;
}

export function useDeadlineNotifications() {
    const [deadlineNotifs, setDeadlineNotifs] = useState<Notification[]>([]);

    const load = useCallback(async () => {
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                fetch("/api/tasks/"),
                fetch("/api/projects/?state=active"),]);

            const tasks: RawTask[] = tasksRes.ok ? await tasksRes.json() : [];
            const projects: RawProject[] = projectsRes.ok ? await projectsRes.json() : [];

            console.log("tasks:", tasks);
            console.log("projects:", projects);

            const notifs = [
                ...taskNotifications(tasks),
                ...projectNotifications(projects),
            ];

            console.log("notifs generadas:", notifs);

            setDeadlineNotifs(notifs);
        } catch (e) {
            console.error("useDeadlineNotifications error:", e);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [load]);

    return deadlineNotifs;
}