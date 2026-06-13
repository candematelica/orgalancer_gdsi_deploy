"use client";

import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useRateSuggestion } from "../_hooks/use_rate_suggestion";
import { Button } from "./financial_form";

const COIN_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$",
  MXN: "$", BRL: "R$", CLP: "$", COP: "$", JPY: "¥",
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  fixed_price: "precio fijo",
  retainer: "retainer",
  hourly: "por hora",
};

export default function RateAdjustmentAlert() {
  const { suggestion, loading, insights, insightErrors, streamingProjectId, getInsight } =
    useRateSuggestion();

  if (loading || !suggestion || !suggestion.has_suggestion) return null;

  const sym = COIN_SYMBOL[suggestion.currency] ?? suggestion.currency;
  const flagged = suggestion.projects.filter((p) => p.has_suggestion);

  return (
    <div className="space-y-4">
      {flagged.map((project) => {
        const insight = insights[project.project_id];
        const insightError = insightErrors[project.project_id];
        const streaming = streamingProjectId === project.project_id;
        const contractLabel = CONTRACT_TYPE_LABELS[project.contract_type] ?? project.contract_type;

        return (
          <div key={project.project_id} className="space-y-3">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p>
                  <span className="font-semibold">&quot;{project.project_name}&quot;</span> ({contractLabel}) tuvo
                  una tarifa efectiva de{" "}
                  <span className="font-semibold">{sym}{project.effective_hourly_rate}/hora</span>{" "}
                  en {project.total_hours}h trabajadas, por debajo del margen mínimo del{" "}
                  {suggestion.threshold_margin_pct}% sobre tu tarifa de {sym}{suggestion.current_hourly_rate}/hora.
                </p>
                <p className="mt-1">
                  Para próximos proyectos similares te sugerimos cotizar a{" "}
                  <span className="font-semibold">{sym}{project.suggested_hourly_rate}/hora</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Análisis del Asistente IA</p>
                <p className="text-xs text-gray-400">Contexto de mercado para trabajos similares</p>
              </div>
              <Button
                type="button"
                onClick={() => getInsight(project.project_id)}
                disabled={streaming}
                className="flex items-center gap-2"
              >
                {streaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {streaming ? "Analizando..." : "Pedir análisis"}
              </Button>
            </div>

            {insightError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {insightError}
              </p>
            )}

            {(insight || streaming) && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <span className="text-xs font-semibold text-violet-700">Análisis del Asistente</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {insight}
                  {streaming && (
                    <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse align-middle" />
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
