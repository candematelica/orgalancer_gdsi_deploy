"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingStep = "profile" | "client" | "project";

interface StepsState {
  profile: boolean;
  client:  boolean;
  project: boolean;
}

interface OnboardingState {
  checked: boolean;
  skipped: boolean;
  steps: StepsState;
}

interface OnboardingContextValue {
  state:       OnboardingState;
  currentStep: OnboardingStep | null;
  allDone:     boolean;
  skip:        () => void;
  resume:      () => void;
  markStep:    (step: OnboardingStep) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Key por usuario para que el flag no se comparta entre cuentas distintas
// en el mismo navegador.
function skipKey(): string {
  try {
    const raw = localStorage.getItem("user");
    const id  = raw ? JSON.parse(raw)?.id : null;
    return id ? `onboarding_skipped_${id}` : "onboarding_skipped";
  } catch {
    return "onboarding_skipped";
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    checked: false,
    skipped: false,
    steps:   { profile: false, client: false, project: false },
  });

  const checkStatus = useCallback(async () => {
    const skipped = localStorage.getItem(skipKey()) === "true";

    // Las tres consultas en paralelo: settings, clients, projects
    const [settingsRes, clientsRes, projectsRes] = await Promise.allSettled([
      fetch("/api/settings"),
      fetch("/api/clients"),
      fetch("/api/projects"),
    ]);

    const settings = settingsRes.status === "fulfilled" && settingsRes.value.ok
      ? await settingsRes.value.json() : null;
    // Perfil completo = tiene phone Y country cargados.
    // full_name, email y profession ya vienen del registro, no son suficientes.
    const profileDone = !!(settings?.phone?.trim() && settings?.country?.trim());

    const clients  = clientsRes.status  === "fulfilled" && clientsRes.value.ok
      ? await clientsRes.value.json() : [];
    const projects = projectsRes.status === "fulfilled" && projectsRes.value.ok
      ? await projectsRes.value.json() : [];

    setState({
      checked: true,
      skipped,
      steps: {
        profile: profileDone,
        client:  Array.isArray(clients)  && clients.length  > 0,
        project: Array.isArray(projects) && projects.length > 0,
      },
    });
  }, []);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  // Primer paso pendiente en orden obligatorio
  const currentStep: OnboardingStep | null =
    !state.checked        ? null
    : !state.steps.profile ? "profile"
    : !state.steps.client  ? "client"
    : !state.steps.project ? "project"
    : null;

  const allDone = state.checked && currentStep === null;

  function skip() {
    localStorage.setItem(skipKey(), "true");
    setState(s => ({ ...s, skipped: true }));
  }

  function resume() {
    localStorage.removeItem(skipKey());
    setState(s => ({ ...s, skipped: false }));
  }

  // Llamar desde cada página luego de un guardado exitoso
  function markStep(step: OnboardingStep) {
    setState(s => ({
      ...s,
      skipped: false,
      steps: { ...s.steps, [step]: true },
    }));
    if (step === "project") localStorage.removeItem(skipKey());
  }

  return (
    <OnboardingContext.Provider value={{ state, currentStep, allDone, skip, resume, markStep }}>
      {children}
    </OnboardingContext.Provider>
  );
}