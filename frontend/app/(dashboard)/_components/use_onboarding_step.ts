"use client";

/**
 * use_onboarding_step
 *
 * Use to notify the onboarding wizard that a step has been completed.
 * Call `complete()` after a successful fetch.
 */

import { useOnboarding, type OnboardingStep } from "./onboarding_context";

export function useOnboardingStep(step: OnboardingStep) {
  const { markStep, currentStep } = useOnboarding();

  // true if this is the step the wizard is currently expecting
  const isActive = currentStep === step;

  function complete() {
    markStep(step);
  }

  return { complete, isActive };
}