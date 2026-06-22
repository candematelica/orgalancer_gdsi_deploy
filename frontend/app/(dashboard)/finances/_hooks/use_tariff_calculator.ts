"use client";

import { useMemo, useState } from "react";
import { API_BASE } from "../_lib/api";

export interface TariffInputs {
  desired_salary: string;
  monthly_hours: string;
  fixed_expenses: string;
}

export interface TariffCalc {
  min_rate: number;
  daily_rate: number;
  monthly_estimated: number;
  junior: number;
  mid: number;
  senior: number;
  below_minimum: boolean;
  gap: number;
}

interface SuggestionContext {
  user_id: string;
  current_hourly_rate: number;
  coin_type: string;
  profession: string;
  years_of_experience: string | null;
  country: string | null;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function useTariffCalculator(ctx: SuggestionContext) {
  const [inputs, setInputs] = useState<TariffInputs>({
    desired_salary: "",
    monthly_hours: "160",
    fixed_expenses: "0",
  });
  const [suggestion, setSuggestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const calc = useMemo<TariffCalc | null>(() => {
    const salary = parseFloat(inputs.desired_salary);
    const hours = parseFloat(inputs.monthly_hours);
    const expenses = parseFloat(inputs.fixed_expenses) || 0;

    if (!salary || !hours || hours <= 0) return null;

    const min_rate = round2((salary + expenses) / hours);
    return {
      min_rate,
      daily_rate: round2(min_rate * 8),
      monthly_estimated: round2(min_rate * hours),
      junior: round2(min_rate * 1.2),
      mid: round2(min_rate * 1.5),
      senior: round2(min_rate * 2.0),
      below_minimum: ctx.current_hourly_rate > 0 && ctx.current_hourly_rate < min_rate,
      gap: round2(ctx.current_hourly_rate - min_rate),
    };
  }, [inputs, ctx.current_hourly_rate]);

  function handleChange(field: keyof TariffInputs, value: string) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  async function getSuggestion() {
    if (!calc) return;
    setStreaming(true);
    setSuggestion("");
    setStreamError(null);

    try {
      const res = await fetch(`/api/tariff/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: ctx.user_id,
          desired_salary: parseFloat(inputs.desired_salary),
          monthly_hours: parseFloat(inputs.monthly_hours),
          fixed_expenses: parseFloat(inputs.fixed_expenses) || 0,
          current_hourly_rate: ctx.current_hourly_rate,
          coin_type: ctx.coin_type,
          profession: ctx.profession,
          years_of_experience: ctx.years_of_experience ?? "1-3",
          country: ctx.country,
        }),
      });

      if (!res.ok || !res.body) {
        setStreamError("No se pudo conectar con el asistente.");
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
            setStreamError(data.replace("[ERROR]", "").trim());
            break;
          }
          // Restore escaped newlines from the SSE encoding
          setSuggestion((prev) => prev + data.replace(/\\n/g, "\n"));
        }
      }
    } catch {
      setStreamError("Error de conexión con el servidor.");
    } finally {
      setStreaming(false);
    }
  }

  return {
    inputs,
    handleChange,
    calc,
    suggestion,
    streaming,
    streamError,
    getSuggestion,
  };
}
