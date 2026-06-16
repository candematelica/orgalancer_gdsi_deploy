"use client";

import { useState } from "react";
import SectionHeader from "../_components/section_header";
import SettingsNav, { type TabId } from "./_components/settings_nav";
import ProfileTab from "./_components/profile_tab";
import ComingSoonTab from "./_components/coming_soon_tab";
import OnboardingBanner from "../_components/onboarding_banner";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <>
      <OnboardingBanner />
      <SectionHeader
        title="Configuración"
        subtitle="Personaliza tu experiencia en Orgalancer"
        icon={<Settings className="w-8 h-8 text-indigo-600" />}
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <SettingsNav active={activeTab} onChange={setActiveTab} />
        <main className="flex-1 min-w-0">
          {activeTab === "profile"       && <ProfileTab />}
          {activeTab === "notifications" && <ComingSoonTab tabId="notifications" />}
          {activeTab === "billing"       && <ComingSoonTab tabId="billing" />}
          {activeTab === "preferences"   && <ComingSoonTab tabId="preferences" />}
          {activeTab === "security"      && <ComingSoonTab tabId="security" />}
        </main>
      </div>
    </>
  );
}