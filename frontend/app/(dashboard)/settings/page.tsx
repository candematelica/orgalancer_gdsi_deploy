"use client";

// Settings page. Manages active tab state and maps each TabId to its view.

import { useState } from "react";
import SectionHeader from "../_components/section_header";
import SettingsNav, { type TabId } from "./_components/settings_nav";
import ProfileTab from "./_components/profile_tab";
import ComingSoonTab from "./_components/coming_soon_tab";

import { Settings } from "lucide-react";

const TAB_VIEWS: Record<TabId, React.ReactNode> = {
  profile:       <ProfileTab />,
  notifications: <ComingSoonTab tabId="notifications" />,
  billing:       <ComingSoonTab tabId="billing" />,
  preferences:   <ComingSoonTab tabId="preferences" />,
  security:      <ComingSoonTab tabId="security" />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <>
      <SectionHeader
        title="Configuración"
        subtitle="Personaliza tu experiencia en Orgalancer"
        icon={<Settings className="w-8 h-8 text-indigo-600"/>}
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <SettingsNav active={activeTab} onChange={setActiveTab} />
        <main className="flex-1 min-w-0">
          {TAB_VIEWS[activeTab]}
        </main>
      </div>
    </>
  );
}