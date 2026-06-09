"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useOnboarding, type OnboardingStep } from "./onboarding_context";

const STEPS: {
  key:   OnboardingStep;
  label: string;
  desc:  string;
  route: string;
  icon:  string;
}[] = [
  {
    key:   "profile",
    label: "Completá tu perfil",
    desc:  "Agregá teléfono y país para que tus clientes te conozcan.",
    route: "/settings",
    icon:  "👤",
  },
  {
    key:   "finances",
    label: "Configurá tus finanzas",
    desc:  "Tarifa horaria y moneda para calcular presupuestos.",
    route: "/finances",
    icon:  "💰",
  },
  {
    key:   "client",
    label: "Agregá tu primer cliente",
    desc:  "Con quién vas a trabajar primero.",
    route: "/clients",
    icon:  "🤝",
  },
  {
    key:   "project",
    label: "Creá tu primer proyecto",
    desc:  "El eje de la plataforma para gestionar todo.",
    route: "/projects",
    icon:  "🚀",
  },
];

interface Props {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: Props) {
  const { currentStep, skip } = useOnboarding();
  const router = useRouter();

  function handleStart() {
    const target = STEPS.find(s => s.key === currentStep)?.route ?? "/settings";
    onClose();
    router.push(target);
  }

  function handleSkip() {
    skip();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">
                Bienvenido a Orgalancer
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                Configurá tu cuenta en 4 pasos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Solo toma unos minutos. Podés omitir y retomar cuando quieras.
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-300 hover:text-gray-500 transition mt-0.5 flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pasos */}
        <div className="px-6 py-4 space-y-2">
          {STEPS.map((s, i) => {
            const isFirst = s.key === currentStep;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isFirst
                    ? "bg-violet-50 border border-violet-200"
                    : "border border-transparent"
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base
                  ${isFirst ? "bg-violet-100" : "bg-gray-100"}
                `}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isFirst ? "text-violet-900" : "text-gray-700"}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs ${isFirst ? "text-violet-600" : "text-gray-400"}`}>
                    {s.desc}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  isFirst
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Omitir por ahora
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
          >
            Empezar →
          </button>
        </div>

      </div>
    </div>
  );
}