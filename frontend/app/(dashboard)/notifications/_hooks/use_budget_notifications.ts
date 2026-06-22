"use client";

import { useEffect, useState, useCallback } from "react";
import { Notification } from "../../_components/notification_dropdown";

interface RawBudget {
    id: string;
    name: string;
    status: string; // "pending" | "approved" | "rejected"
    responded_at: string | null;
    client_name?: string | null;
    project_name?: string | null;
}

function relativeTime(dateStr: string): string {
    const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / 60_000);
    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `Hace ${diffH} h`;
    return `Hace ${Math.round(diffH / 24)} d`;
}

function budgetNotifications(budgets: RawBudget[]): Notification[] {
    const result: Notification[] = [];
    for (const b of budgets) {
        if (b.status !== "approved" && b.status !== "rejected") continue;
        if (!b.responded_at) continue;

        const approved = b.status === "approved";
        result.push({
            id: `budget-${b.id}-${b.status}`,
            type: "payment",
            title: approved ? `Presupuesto aprobado: ${b.name}` : `Presupuesto rechazado: ${b.name}`,
            description: `${b.client_name ?? "El cliente"} ${approved ? "aprobó" : "rechazó"} el presupuesto${b.project_name ? ` del proyecto ${b.project_name}` : ""}.`,
            time: relativeTime(b.responded_at),
            read: false,
        });
    }
    return result;
}

export function useBudgetNotifications() {
    const [budgetNotifs, setBudgetNotifs] = useState<Notification[]>([]);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/budgets", { cache: "no-store" });
            const budgets: RawBudget[] = res.ok ? await res.json() : [];
            setBudgetNotifs(budgetNotifications(budgets));
        } catch (e) {
            console.error("useBudgetNotifications error:", e);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 60 * 1000);
        return () => clearInterval(interval);
    }, [load]);

    return budgetNotifs;
}
