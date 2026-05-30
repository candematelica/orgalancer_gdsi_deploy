"use client";

// Profile tab. Fetches user data (GET) and composes AvatarUpload + ProfileForm.

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import AvatarUpload from "./avatar_upload";
import ProfileForm, { type ProfileData } from "./profile_form";
import SettingsShell from "./settings_layout";

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-gray-200" />
          <div className="h-3 w-44 rounded bg-gray-100" />
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/settings");

        if (!res.ok) throw new Error();
        const data: ProfileData = await res.json();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("No se pudo cargar el perfil. Por favor, intenta nuevamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const update = (partial: Partial<ProfileData>) =>
    setProfile(prev => prev ? { ...prev, ...partial } : prev);

  return (
    <SettingsShell title="Información Personal">
      {loading && <Skeleton />}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {!loading && profile && (
        <>
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>Porcentaje de finalización del perfil</span>
              <span className="text-purple-600">{profile.completion_percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${profile.completion_percentage}%` }}
              />
            </div>
          </div>
          <AvatarUpload
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
            onUploadSuccess={url => update({ avatar_url: url })}
          />
          <ProfileForm profile={profile} onUpdate={update} />
        </>
      )}
    </SettingsShell>
  );
}