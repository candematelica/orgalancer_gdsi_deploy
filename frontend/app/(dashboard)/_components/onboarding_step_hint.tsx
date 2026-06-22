"use client";

import { Info } from "lucide-react";
import { useOnboardingStep } from "./use_onboarding_step";
import { type OnboardingStep } from "./onboarding_context";

const HINTS: Record<OnboardingStep, { title: string; fields: string[] }> = {
  profile: {
    title: "Para continuar la configuración inicial completá estos campos:",
    fields: ["Teléfono", "País"],
  },
  finances: {
    title: "Para continuar la configuración inicial completá estos campos:",
    fields: ["Moneda", "Tarifa por hora", "Margen de ganancia"],
  },
  client: {
    title: "Para continuar la configuración inicial completá estos campos:",
    fields: ["Nombre o razón social", "Email de contacto", "Tipo de cliente"],
  },
  project: {
    title: "Para continuar la configuración inicial completá estos campos:",
    fields: ["Cliente", "Nombre del proyecto", "Presupuesto estimado"],
  },
};

export default function OnboardingStepHint({ step }: { step: OnboardingStep }) {
  const { isActive } = useOnboardingStep(step);

  if (!isActive) return null;

  const hint = HINTS[step];

  return (
    <div className="mb-6 flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4">
      <Info className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-violet-800 mb-1.5">
          {hint.title}
        </p>
        <div className="flex flex-wrap gap-2">
          {hint.fields.map(f => (
            <span
              key={f}
              className="text-xs bg-violet-100 text-violet-700 font-medium px-2.5 py-1 rounded-lg"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}