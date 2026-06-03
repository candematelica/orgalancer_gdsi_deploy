"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useDeadlineNotifications } from "../notifications/_hooks/use_deadline_notifications";

export type Notification = {
    id: string;
    type: "payment" | "task" | "client" | "system";
    title: string;
    description: string;
    time: string;
    read: boolean;
};

const LS_DELETED = "notif_deleted_ids";
const LS_READ    = "notif_read_ids";

function loadSet(key: string): Set<string> {
    try {
        const raw = localStorage.getItem(key);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveSet(key: string, set: Set<string>) {
    localStorage.setItem(key, JSON.stringify([...set]));
}

const typeConfig: Record<
    Notification["type"],
    { color: string; bg: string; icon: React.ReactNode }
> = {
    payment: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v1M12 16v1M9 9.5c0-1.1.9-2 2-2h2a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h2a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    task: {
        color: "text-violet-600",
        bg: "bg-violet-50",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    client: {
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 20c0-3.3 3.1-6 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="17" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M22 20c0-3.3-2.2-6-5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    system: {
        color: "text-pink-600",
        bg: "bg-pink-50",
        icon: (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
};

const deadlineIcon = (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function syncBadge(notifications: Notification[]) {
    const count = notifications.filter((n) => !n.read).length;
    localStorage.setItem("notifications_unread", String(count));
    window.dispatchEvent(new Event("notifications_updated"));
}

function isDeadlineNotif(id: string) {
    return id.startsWith("deadline-task-") || id.startsWith("deadline-project-");
}

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [deletedIds, setDeletedIds] = useState<Set<string>>(() => loadSet(LS_DELETED));
    const [readIds,    setReadIds]    = useState<Set<string>>(() => loadSet(LS_READ));

    const panelRef  = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const deadlineNotifs = useDeadlineNotifications();

    const notifications = useMemo(() => {
        return deadlineNotifs
            .filter((n) => !deletedIds.has(n.id))
            .map((n) => readIds.has(n.id) ? { ...n, read: true } : n);
    }, [deadlineNotifs, deletedIds, readIds]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    useEffect(() => { syncBadge(notifications); }, [notifications]);

    // Cerrar al click fuera
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current  && !panelRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)
            ) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const markRead = (id: string) => {
        setReadIds((prev) => {
            const next = new Set([...prev, id]);
            saveSet(LS_READ, next);
            return next;
        });
    };

    const markAllRead = () => {
        setReadIds((prev) => {
            const next = new Set([...prev, ...notifications.filter((n) => !n.read).map((n) => n.id)]);
            saveSet(LS_READ, next);
            return next;
        });
    };

    const deleteNotification = (id: string) => {
        setDeletedIds((prev) => {
            const next = new Set([...prev, id]);
            saveSet(LS_DELETED, next);
            return next;
        });
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setOpen((v) => !v)}
                aria-label="Abrir notificaciones"
                aria-expanded={open}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
                    open ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Centro de notificaciones"
                    className="absolute right-0 top-12 z-50 w-[420px] bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Notificaciones</span>
                            {unreadCount > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                                    {unreadCount} sin leer
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    title="Marcar todas como leídas"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                    <CheckCheck size={13} />
                                    Marcar todas
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Cerrar"
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Bell className="w-10 h-10 mb-3 opacity-25" />
                                <p className="text-sm font-medium">Sin notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const isDeadline = isDeadlineNotif(n.id);
                                const cfg = typeConfig[n.type];

                                return (
                                    <div
                                        key={n.id}
                                        className={`group flex items-start gap-3 px-4 py-3 transition-colors ${
                                            n.read
                                                ? "bg-white hover:bg-gray-50/60"
                                                : isDeadline
                                                    ? "bg-amber-50/40 hover:bg-amber-50/70"
                                                    : "bg-indigo-50/30 hover:bg-indigo-50/50"
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${
                                            isDeadline ? "bg-amber-50 text-amber-600" : `${cfg.bg} ${cfg.color}`
                                        }`}>
                                            {isDeadline ? deadlineIcon : cfg.icon}
                                        </div>

                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => !n.read && markRead(n.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-xs font-semibold leading-snug ${n.read ? "text-gray-600" : "text-gray-900"}`}>
                                                    {n.title}
                                                    {!n.read && (
                                                        <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle ${
                                                            isDeadline ? "bg-amber-500" : "bg-indigo-500"
                                                        }`} />
                                                    )}
                                                </p>
                                                <span className="flex-shrink-0 text-[10px] text-gray-400 mt-0.5">{n.time}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                                                {n.description}
                                            </p>
                                            {isDeadline && (
                                                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
                                                    Vencimiento próximo
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                                            {!n.read && (
                                                <button
                                                    onClick={() => markRead(n.id)}
                                                    title="Marcar como leída"
                                                    className="p-1 rounded-md hover:bg-indigo-100 text-indigo-400 transition-colors"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                title="Descartar"
                                                className="p-1 rounded-md hover:bg-red-100 text-red-400 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}