"use client";

import { useEffect, useState } from "react";

export interface ProjectRateAdjustmentSuggestion {
  project_id: string;
  project_name: string;
  contract_type: string;
  total_hours: number;
  actual_income: number;
  potential_income: number;
  effective_hourly_rate: number;
  has_suggestion: boolean;
  suggested_hourly_rate?: number | null;
}

export interface RateAdjustmentSuggestion {
  has_suggestion: boolean;
  current_hourly_rate: number;
  min_acceptable_rate?: number | null;
  threshold_margin_pct: number;
  currency: string;
  reason?: string | null;
  projects: ProjectRateAdjustmentSuggestion[];
}

export function useRateSuggestion() {
  const [suggestion, setSuggestion] = useState<RateAdjustmentSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [insightErrors, setInsightErrors] = useState<Record<string, string>>({});
  const [streamingProjectId, setStreamingProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tariff/rate-adjustment", { cache: "no-store" })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => setSuggestion(data))
      .catch(() => setSuggestion(null))
      .finally(() => setLoading(false));
  }, []);

  async function getInsight(projectId: string) {
    setStreamingProjectId(projectId);
    setInsights((prev) => ({ ...prev, [projectId]: "" }));
    setInsightErrors((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });

    try {
      const res = await fetch(`/api/tariff/rate-adjustment/insight/${projectId}`, { method: "POST" });

      if (!res.ok || !res.body) {
        setInsightErrors((prev) => ({ ...prev, [projectId]: "No se pudo conectar con el asistente." }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        for (const line of raw.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          if (data.startsWith("[ERROR]")) {
            setInsightErrors((prev) => ({ ...prev, [projectId]: data.replace("[ERROR]", "").trim() }));
            break;
          }
          setInsights((prev) => ({
            ...prev,
            [projectId]: (prev[projectId] ?? "") + data.replace(/\\n/g, "\n"),
          }));
        }
      }
    } catch {
      setInsightErrors((prev) => ({ ...prev, [projectId]: "Error de conexión con el servidor." }));
    } finally {
      setStreamingProjectId(null);
    }
  }

  return { suggestion, loading, insights, insightErrors, streamingProjectId, getInsight };
}
