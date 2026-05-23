"use client";
import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../_lib/api";

type TimerStatus = "idle" | "running" | "paused";

const STORAGE_KEY = "timer_state";

export function useTimer(projectId: string, taskId: string, onTimeSaved: ((durationMinutes: number) => void) | undefined) {
  const [status, setStatus]   = useState<TimerStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaurar estado desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const { status: savedStatus, seconds: savedSeconds, description: savedDesc, projectId: savedProjectId, taskId: savedTaskId } = JSON.parse(saved);
          if (savedProjectId === projectId && savedTaskId === taskId) {
            setStatus(savedStatus);
            setSeconds(savedSeconds);
            setDescription(savedDesc);
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [projectId, taskId]);

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== "undefined" && status !== "idle") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, seconds, description, projectId, taskId }));
    }
  }, [status, seconds, description, projectId, taskId]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status]);

  const start  = () => setStatus("running");
  const pause  = () => setStatus("paused");
  const resume = () => setStatus("running");
  const reset  = () => { setStatus("idle"); setSeconds(0); localStorage.removeItem(STORAGE_KEY); };

  const formatTime = (s = seconds) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

   async function handleStop() {
    const durationMinutes = Math.ceil(seconds / 60);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          task_id: taskId,
          entry_date: new Date().toISOString().split("T")[0],
          duration_minutes: durationMinutes,
          description: description || "",
          source: "timer",
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      reset();
      setDescription("");
      onTimeSaved?.(durationMinutes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };


  return { status, seconds, start, pause, resume, reset, formatTime, handleStop, saving, error, description, setDescription };
}