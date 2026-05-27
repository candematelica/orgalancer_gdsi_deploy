import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  SquareCheck,
  TrendingUp,
  Bot,
  Settings
} from "lucide-react";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Proyectos",
    href: "/projects",
    icon: <Briefcase size={18} />,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: <UserPlus size={18} />,
  },
  {
    label: "Tareas",
    href: "/tasks",
    icon: <SquareCheck size={18} />,
  },
  {
    label: "Ingresos",
    href: "/revenue",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 12.5h.01M18 12.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Finanzas",
    href: "/finances",
    icon: <TrendingUp size={18} />,
  },
  {
    label: "Asistente Virtual",
    href: "/assistant",
    icon: <Bot size={18} />,
  },
  {
    label: "Configuración",
    href: "/settings",
    icon: <Settings size={18} />,
  },
  {
    href: "/notifications",
    label: "Notificaciones",
    showBadge: true,
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];
