"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useOnboarding, type OnboardingStep } from "./onboarding_context";

const STEPS: { key: OnboardingStep; label: string; route: string }[] = [
  { key: "profile",  label: "Perfil",    route: "/settings" },
  { key: "finances", label: "Finanzas",  route: "/finances" },
  { key: "client",   label: "Cliente",   route: "/clients"  },
  { key: "project",  label: "Proyecto",  route: "/projects" },
];

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

  const stepIndex = STEPS.findIndex(s => s.key === currentStep);
  const completed = Object.values(state.steps).filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-violet-600 transition-all duration-500"
          style={{ width: `${(completed / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="px-4 py-2.5 flex items-center gap-4">
        <span className="text-xs font-semibold text-violet-600 whitespace-nowrap flex-shrink-0">
          Paso {stepIndex + 1} de {STEPS.length}
        </span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {STEPS.map((s, i) => {
            const done   = state.steps[s.key];
            const active = s.key === currentStep;
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${done   ? "bg-violet-600"
                  : active ? "bg-violet-600 ring-2 ring-violet-300 ring-offset-1"
                           : "bg-gray-100 border border-gray-200"}
                `}>
                  {done
                    ? <CheckCircle2 className="w-3 h-3 text-white" />
                    : <span className={`text-[10px] font-bold ${active ? "text-white" : "text-gray-400"}`}>{i + 1}</span>
                  }
                </div>
                <span className={`text-xs whitespace-nowrap transition-colors ${
                  done    ? "text-violet-600 font-medium"
                  : active ? "text-gray-800 font-semibold"
                           : "text-gray-400"
                }`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px bg-gray-200 flex-shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={skip}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          aria-label="Omitir configuración"
        >
          <X className="w-3.5 h-3.5" />
          Omitir
        </button>
      </div>
    </div>
  );
}