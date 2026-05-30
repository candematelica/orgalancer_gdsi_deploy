"use client";

import { X } from "lucide-react";

export type Notification = {
  id: string;
  type: "payment" | "task" | "client" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const typeConfig: Record<Notification["type"], { color: string; bg: string; icon: React.ReactNode }> = {
  payment: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v1M12 16v1M9 9.5c0-1.1.9-2 2-2h2a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h2a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  task: {
    color: "text-violet-600",
    bg: "bg-violet-50",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  client: {
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
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
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

type Props = {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function NotificationItem({ notification, onMarkRead, onDelete }: Props) {
  const cfg = typeConfig[notification.type];

  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
        notification.read
          ? "bg-white border-gray-100"
          : "bg-indigo-50/40 border-indigo-100"
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={() => !notification.read && onMarkRead(notification.id)}>
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${notification.read ? "text-gray-700" : "text-gray-900"}`}>
            {notification.title}
            {!notification.read && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-500 align-middle" />
            )}
          </p>
          <span className="flex-shrink-0 text-xs text-gray-400">{notification.time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.description}</p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors"
            title="Marcar como leída"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
          title="Eliminar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}