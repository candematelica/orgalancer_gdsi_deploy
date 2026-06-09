"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingStep = "profile" | "finances" | "client" | "project";

interface StepsState {
  profile:  boolean;
  finances: boolean;
  client:   boolean;
  project:  boolean;
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

function skipKey(): string {
  try {
    const raw = localStorage.getItem("user");
    const id  = raw ? JSON.parse(raw)?.id : null;
    return id ? `onboarding_skipped_${id}` : "onboarding_skipped";
  } catch {
    return "onboarding_skipped";
  }
}

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw)?.id : null;
  } catch {
    return null;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    checked: false,
    skipped: false,
    steps:   { profile: false, finances: false, client: false, project: false },
  });

  const checkStatus = useCallback(async () => {
    const skipped = localStorage.getItem(skipKey()) === "true";
    const userId  = getUserId();

    const [settingsRes, financesRes, clientsRes, projectsRes] = await Promise.allSettled([
      fetch("/api/settings"),
      userId ? fetch(`${API_BASE}/finances/${userId}`) : Promise.reject(),
      fetch("/api/clients"),
      fetch("/api/projects"),
    ]);

    // Perfil completo = tiene phone Y country
    const settings    = settingsRes.status === "fulfilled" && settingsRes.value.ok
      ? await settingsRes.value.json() : null;
    const profileDone = !!(settings?.phone?.trim() && settings?.country?.trim());

    // Finanzas completas = tiene hourly_rate Y profit_margin Y coin_type
    const finances     = financesRes.status === "fulfilled" && financesRes.value.ok
      ? await financesRes.value.json() : null;
    const financesDone = !!(
      finances?.hourly_rate &&
      finances?.profit_margin &&
      finances?.coin_type
    );

    const clients  = clientsRes.status  === "fulfilled" && clientsRes.value.ok
      ? await clientsRes.value.json() : [];
    const projects = projectsRes.status === "fulfilled" && projectsRes.value.ok
      ? await projectsRes.value.json() : [];

    setState({
      checked: true,
      skipped,
      steps: {
        profile:  profileDone,
        finances: financesDone,
        client:   Array.isArray(clients)  && clients.length  > 0,
        project:  Array.isArray(projects) && projects.length > 0,
      },
    });
  }, []);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  const currentStep: OnboardingStep | null =
    !state.checked          ? null
    : !state.steps.profile  ? "profile"
    : !state.steps.finances ? "finances"
    : !state.steps.client   ? "client"
    : !state.steps.project  ? "project"
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