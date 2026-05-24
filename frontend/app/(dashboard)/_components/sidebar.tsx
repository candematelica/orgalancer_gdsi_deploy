"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "./nav_items";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const read = () => {
      const raw = localStorage.getItem("notifications_unread");
      setUnreadCount(raw ? parseInt(raw, 10) : 0);
    };
    read();
    window.addEventListener("notifications_updated", read);
    return () => window.removeEventListener("notifications_updated", read);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="w-60 min-h-screen bg-gradient-to-b from-violet-800 to-purple-900 flex flex-col font-bold">
      {/* 1. Header / Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" />
            <path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" fill="white" opacity="0.7" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm leading-tight">Orgalancer</p>
          <p className="text-purple-200 text-xs font-medium">Gestión Freelance</p>
        </div>
      </div>

      <div className="mb-4 mx-4 border-t border-white/10" />

      {/* 2. Main Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const is_active = pathname === item.href;
          const badge = item.showBadge ? unreadCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all leading-none ${is_active
                  ? "bg-white/20 text-white shadow-[0_0_20px_rgba(0,0,0,0.25)] scale-[1.02]"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
                }`}
            >
              {/* Icon — with optional badge */}
              <span className={`relative flex items-center justify-center ${is_active ? "text-white" : "text-purple-300"}`}>
                {item.icon}
                {badge > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-0.5 bg-white text-violet-700 text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>

              <span className="pt-0.5 flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 space-y-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-200 hover:bg-red-500/20 hover:text-red-200 transition-all leading-none"
        >
          <span className="pt-0.5 flex items-center gap-3">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" className="rotate-180">
              <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Cerrar Sesión
          </span>
        </button>

        <div className="my-2 mx-4 border-t border-white/10" />

        <div className="p-4 rounded-xl bg-white/10 shadow-lg">
          <p className="text-purple-200 text-xs mb-0.5 font-medium">Plan Actual</p>
          <p className="text-white text-sm font-bold">Profesional</p>
          <button className="text-purple-200 text-xs mt-1 hover:text-white transition-colors font-bold">
            Actualizar plan →
          </button>
        </div>
      </div>
    </aside>
  );
}