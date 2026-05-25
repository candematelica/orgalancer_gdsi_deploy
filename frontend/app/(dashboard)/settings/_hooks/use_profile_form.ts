"use client";

// Form state, validation, and profile update (PUT) logic for the profile tab.

import { useState, useEffect } from "react";
import { ProfileData } from "../_components/profile_form";

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

export function useProfileForm(profile: ProfileData, onUpdate: (updated: Partial<ProfileData>) => void) {
  const { first: initFirst, last: initLast } = splitName(profile.full_name);

  const [firstName, setFirstName] = useState(initFirst);
  const [lastName, setLastName] = useState(initLast);
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [specialty, setSpecialty] = useState(profile.specialty ?? "");
  const [yearsExp, setYearsExp] = useState(profile.years_of_experience ?? "");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { first, last } = splitName(profile.full_name);
    setFirstName(first);
    setLastName(last);
    setPhone(profile.phone ?? "");
    setCountry(profile.country ?? "");
    setSpecialty(profile.specialty ?? "");
    setYearsExp(profile.years_of_experience ?? "");
    setProfession(profile.profession ?? "");
  }, [profile]);

  const resetFields = () => {
    const { first, last } = splitName(profile.full_name);
    setFirstName(first);
    setLastName(last);
    setPhone(profile.phone ?? "");
    setCountry(profile.country ?? "");
    setSpecialty(profile.specialty ?? "");
    setYearsExp(profile.years_of_experience ?? "");
    setError(null);
  };

  const handleSave = async () => {
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!fullName) {
      setError("El nombre completo no puede estar vacío.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        full_name: fullName,
        profession: profession.trim() || null,
        phone: phone.trim() || null,
        country: country || null,
        specialty: specialty.trim() || null,
        years_of_experience: yearsExp || null,
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudieron guardar los cambios.");
      }

      const updated: Partial<ProfileData> = await res.json();
      onUpdate(updated);

      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...JSON.parse(raw), full_name: fullName })
          );
        }
      } catch { }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSaving(false);
    }
  };

  const missingFields = [
    { val: phone, label: "Teléfono", tip: "Permite que los clientes te contacten rápido." },
    { val: country, label: "País", tip: "Ayuda a ajustar impuestos y zonas horarias." },
    { val: specialty, label: "Especialidad", tip: "Mejora tu visibilidad en búsquedas específicas." },
    { val: yearsExp, label: "Experiencia", tip: "Aumenta la confianza de nuevos clientes." },
  ].filter(f => !f.val);

  return {
    state: { firstName, lastName, profession, phone, country, specialty, yearsExp, saving, success, error, missingFields },
    actions: { setFirstName, setLastName, setProfession, setPhone, setCountry, setSpecialty, setYearsExp, handleSave, resetFields }
  };
}