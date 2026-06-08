"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, ChevronRight, X } from "lucide-react";
import { useOnboarding, type OnboardingStep } from "./onboarding_context";

// ─── Config de pasos — rutas reales del proyecto ──────────────────────────────

const STEPS: { key: OnboardingStep; label: string; hint: string; route: string }[] = [
  {
    key:   "profile",
    label: "Completá tu perfil",
    hint:  "Agregá tu profesión y datos básicos.",
    route: "/settings",
  },
  {
    key:   "client",
    label: "Primer cliente",
    hint:  "Registrá el primer cliente con el que vas a trabajar.",
    route: "/clients",
  },
  {
    key:   "project",
    label: "Primer proyecto",
    hint:  "Creá un proyecto y asocialo a tu cliente.",
    route: "/projects",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingBanner() {
  const { state, currentStep, allDone, skip } = useOnboarding();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!state.checked || state.skipped || !currentStep) return;
    const target = STEPS.find(s => s.key === currentStep)?.route;
    if (target && pathname !== target) router.push(target);
  }, [currentStep, state.checked, state.skipped, pathname, router]);
  
  if (!state.checked || allDone || state.skipped) return null;

  const stepIndex  = STEPS.findIndex(s => s.key === currentStep);
  const activeStep = STEPS[stepIndex];
  const completed  = Object.values(state.steps).filter(Boolean).length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

        {/* Barra de progreso */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(completed / 3) * 100}%` }}
          />
        </div>

        <div className="px-5 py-4 space-y-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
              Configuración inicial · Paso {stepIndex + 1} de 3
            </p>
            <button
              onClick={skip}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition"
              aria-label="Omitir onboarding"
            >
              <X className="w-3.5 h-3.5" />
              Omitir
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const done   = state.steps[s.key];
              const active = s.key === currentStep;
              return (
                <div key={s.key} className="flex items-center gap-1 flex-1 min-w-0">
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${done   ? "bg-violet-600 text-white"
                    : active ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400"
                             : "bg-gray-100 text-gray-400"}
                  `}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs truncate transition-colors ${
                    done    ? "text-violet-600 font-medium"
                    : active ? "text-gray-800 font-semibold"
                             : "text-gray-400"
                  }`}>
                    {s.label}
                  </span>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Hint del paso actual */}
          {activeStep && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              👉 {activeStep.hint}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}