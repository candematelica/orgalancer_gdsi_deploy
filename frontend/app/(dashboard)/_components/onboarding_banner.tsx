"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, ChevronRight, X, ArrowRight } from "lucide-react";
import { useOnboarding, type OnboardingStep } from "./onboarding_context";

const STEPS: {
  key:   OnboardingStep;
  label: string;
  why:   string;
  cta:   string;
  route: string;
  emoji: string;
}[] = [
  {
    key:   "profile",
    label: "Completá tu perfil",
    why:   "Tus clientes ven esta información. Un perfil completo genera más confianza y te ayuda a conseguir mejores proyectos.",
    cta:   "Ir a Configuración",
    route: "/settings",
    emoji: "👤",
  },
  {
    key:   "finances",
    label: "Configurá tus finanzas",
    why:   "Sin tu tarifa horaria y moneda configuradas no podés calcular presupuestos ni medir la rentabilidad de tus proyectos.",
    cta:   "Ir a Finanzas",
    route: "/finances",
    emoji: "💰",
  },
  {
    key:   "client",
    label: "Agregá tu primer cliente",
    why:   "Sin un cliente no podés crear proyectos ni registrar ingresos. Solo toma un minuto.",
    cta:   "Agregar cliente",
    route: "/clients",
    emoji: "🤝",
  },
  {
    key:   "project",
    label: "Creá tu primer proyecto",
    why:   "Los proyectos son el eje de la plataforma: desde acá controlás tiempos, presupuestos y rentabilidad.",
    cta:   "Crear proyecto",
    route: "/projects",
    emoji: "🚀",
  },
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

  const stepIndex  = STEPS.findIndex(s => s.key === currentStep);
  const activeStep = STEPS[stepIndex];
  const completed  = Object.values(state.steps).filter(Boolean).length;
  const total      = STEPS.length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <div className="bg-white border border-violet-100 rounded-2xl shadow-2xl overflow-hidden">

        {/* Barra de progreso */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-5">

            {/* Emoji */}
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0">
              {activeStep?.emoji}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">
                Configuración inicial · Paso {stepIndex + 1} de {total}
              </p>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {activeStep?.label}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {activeStep?.why}
              </p>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Stepper */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map((s, i) => {
                    const done   = state.steps[s.key];
                    const active = s.key === currentStep;
                    return (
                      <div key={s.key} className="flex items-center gap-1.5">
                        <div className={`
                          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                          ${done   ? "bg-violet-600 text-white"
                          : active ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400"
                                   : "bg-gray-100 text-gray-400"}
                        `}>
                          {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-xs hidden sm:block transition-colors ${
                          done    ? "text-violet-600 font-medium"
                          : active ? "text-gray-800 font-semibold"
                                   : "text-gray-400"
                        }`}>
                          {s.label}
                        </span>
                        {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push(activeStep?.route ?? "/")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition flex-shrink-0"
                >
                  {activeStep?.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Omitir */}
            <button
              onClick={skip}
              className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5"
            >
              <X className="w-3 h-3" />
              Omitir
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}