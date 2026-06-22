"use client";

import SectionHeader from "../_components/section_header";
import ProfileTab from "./_components/profile_tab";
import OnboardingBanner from "../_components/onboarding_banner";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <OnboardingBanner />
      <SectionHeader
        title="Configuración"
        subtitle="Personaliza tu experiencia en Orgalancer"
        icon={<Settings className="w-8 h-8 text-indigo-600" />}
      />
      <ProfileTab />
    </>
  );
}