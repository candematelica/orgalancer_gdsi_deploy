"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell } from "lucide-react";
import SectionHeader from "../_components/section_header";
import NotificationItem, { Notification } from "./components/notification_item";

const INITIAL: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Pago recibido de Oscorp Industries",
    description: "Se acreditaron $1,200 por el proyecto Landing Page v2.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "2",
    type: "task",
    title: "Tarea vencida: Revisión de diseño",
    description: "La tarea del proyecto \"App Móvil\" venció ayer sin completarse.",
    time: "Hace 1 h",
    read: false,
  },
  {
    id: "3",
    type: "client",
    title: "Nuevo cliente registrado",
    description: "Charles Leclerc se unió y está esperando tu primer contacto.",
    time: "Hace 3 h",
    read: false,
  },
  {
    id: "4",
    type: "payment",
    title: "Recordatorio de cobro pendiente",
    description: "La factura #0042 por $850 tiene 5 días de vencida. Cliente: LN4.",
    time: "Ayer",
    read: false,
  },
  {
    id: "5",
    type: "system",
    title: "Respaldo automático completado",
    description: "Tus datos fueron exportados correctamente a las 03:00 hs.",
    time: "Ayer",
    read: true,
  },
  {
    id: "6",
    type: "task",
    title: "Tarea completada: API REST",
    description: "Marcaste como completada la tarea del proyecto Backend SaaS.",
    time: "Hace 2 días",
    read: true,
  },
  {
    id: "7",
    type: "client",
    title: "Cliente inactivo: Alpine",
    description: "Alpine no tiene actividad registrada en los últimos 30 días.",
    time: "Hace 3 días",
    read: true,
  },
];

type Filter = "todas" | "no_leidas" | "payment" | "task" | "client" | "system";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "no_leidas", label: "No leídas" },
  { key: "payment", label: "Pagos" },
  { key: "task", label: "Tareas" },
  { key: "client", label: "Clientes" },
  { key: "system", label: "Sistema" },
];

function syncBadge(notifications: Notification[]) {
  const count = notifications.filter((n) => !n.read).length;
  localStorage.setItem("notifications_unread", String(count));
  window.dispatchEvent(new Event("notifications_updated"));
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>("todas");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    syncBadge(notifications);
  }, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "no_leidas") return notifications.filter((n) => !n.read);
    if (filter === "todas") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <SectionHeader
        title="Notificaciones"
        subtitle={
          unreadCount > 0
            ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
            : "Estás al día con todo"
        }
        icon={
          <div className="relative">
            <Bell className="w-8 h-8 text-indigo-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        }
      >
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium shadow-sm text-sm"
          >
            Marcar todas como leídas
          </button>
        )}
      </SectionHeader>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {FILTERS.map(({ key, label }) => {
          const count =
            key === "no_leidas"
              ? notifications.filter((n) => !n.read).length
              : key === "todas"
              ? notifications.length
              : notifications.filter((n) => n.type === key).length;

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                filter === key
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  filter === key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">Sin notificaciones en esta categoría</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 p-3 flex flex-col gap-1">
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}