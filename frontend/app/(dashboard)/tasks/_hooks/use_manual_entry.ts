"use client";

import { useState } from "react";
import { API_BASE } from "../_lib/api";

interface UseManualEntryProps {
  fixedProjectId: string;
  fixedTaskId:    string;
  onSaved?:       (durationMinutes: number) => void;
}

export function useManualEntry({ fixedProjectId, fixedTaskId, onSaved }: UseManualEntryProps) {
  const today = new Date().toISOString().split("T")[0];

  const [date,    setDate]    = useState(today);
  const [hours,   setHours]   = useState("");
  const [minutes, setMinutes] = useState("");
  const [desc,    setDesc]    = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalMinutes = (parseInt(hours || "0") * 60) + parseInt(minutes || "0");
  const showPreview  = totalMinutes > 0;

  const handleSubmit = async () => {
    setError(null);
    if (!date)             { setError("Seleccioná una fecha"); return; }
    if (totalMinutes <= 0) { setError("La duración debe ser mayor a 0"); return; }
    if (!desc.trim())      { setError("La descripción es obligatoria"); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id:       fixedProjectId,
          task_id:          fixedTaskId,
          entry_date:       date,
          duration_minutes: totalMinutes,
          description:      desc.trim(),
          source:           "manual",
        }),
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || "Error al guardar");
      }

      setDate(today);
      setHours("");
      setMinutes("");
      setDesc("");
      onSaved?.(totalMinutes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    today,
    date, setDate,
    hours, setHours,
    minutes, setMinutes,
    desc, setDesc,
    error,
    loading,
    totalMinutes,
    showPreview,
    handleSubmit,
  };
}