"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/sidebar";
import TopNavbar from "./_components/top_navbar";
import { TimerProvider } from "./_lib/TimerContext";
import FloatingTimerWidgetGlobal from "./_components/FloatingTimerWidgetGlobal";
import { OnboardingProvider, useOnboarding } from "./_components/onboarding_context";
import OnboardingModal from "./_components/onboarding_modal";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { state, allDone } = useOnboarding();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mostrar el modal solo si: ya chequeó, hay pasos pendientes, no lo omitió
    if (state.checked && !allDone && !state.skipped) {
      setShowModal(true);
    }
  }, [state.checked, allDone, state.skipped]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
      <FloatingTimerWidgetGlobal />
      {showModal && (
        <OnboardingModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

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
      <OnboardingProvider>
        <DashboardContent>{children}</DashboardContent>
      </OnboardingProvider>
    </TimerProvider>
  );
}