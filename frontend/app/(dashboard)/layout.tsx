"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/sidebar";
import TopNavbar from "./_components/top_navbar";
import { TimerProvider } from "./_lib/TimerContext";
import FloatingTimerWidgetGlobal from "./_components/FloatingTimerWidgetGlobal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <TimerProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
        <FloatingTimerWidgetGlobal />
      </div>
    </TimerProvider>
  );
}