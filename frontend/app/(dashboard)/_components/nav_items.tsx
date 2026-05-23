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
];
