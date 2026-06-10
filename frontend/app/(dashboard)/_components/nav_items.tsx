import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  SquareCheck,
  TrendingUp,
  Bot,
  Settings,
  BarChart3
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
    label: "Movimientos",
    href: "/transactions",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 12.5h.01M18 12.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Presupuestos",
    href: "/budget",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Finanzas",
    href: "/finances",
    icon: <TrendingUp size={18} />,
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: <BarChart3 size={18} />,
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
];
