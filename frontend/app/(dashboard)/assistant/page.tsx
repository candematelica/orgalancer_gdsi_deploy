"use client";

import { useEffect, useState } from "react";
import { Award, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

/* ── Types ── */
interface FinancialConfig {
  coin_type: string;
  hourly_rate: number;
  profit_margin: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  profession: string;
  years_of_experience: string | null;
  country: string | null;
  specialty: string | null;
}

interface MarketBar {
  label: string;
  value: string;
  pct: number;
  gradient: string;
  value_class: string;
  bold?: boolean;
}

interface Analysis {
  sym: string;
  current_rate: number;
  suggested_rate: number;
  monthly_income: number;
  monthly_delta: number;
  position: "Bajo" | "Medio" | "Alto";
  years_label: string;
  interpretation: string[];
  bars: MarketBar[];
  strategy: { phase: string; text: string; shade: "light" | "medium" }[];
}

/* ── Constants ── */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$",
  MXN: "$", BRL: "R$", CLP: "$", COP: "$", JPY: "¥",
};

// [junior, mid, senior, expert] hourly rates by experience range
const BENCHMARKS: Record<string, [number, number, number, number]> = {
  "0-1": [15, 22, 30, 40],
  "1-3": [25, 38, 50, 65],
  "3-5": [38, 55, 70, 88],
  "5-10": [55, 75, 92, 115],
  "10+": [75, 98, 118, 145],
};

const YEARS_LABEL: Record<string, string> = {
  "0-1": "menos de 1 año",
  "1-3": "1 a 3 años",
  "3-5": "3 a 5 años",
  "5-10": "5 a 10 años",
  "10+": "más de 10 años",
};

const HOURS_MONTH = 160;

/* ── Calculation ── */
function analyze(fin: FinancialConfig, prof: UserProfile): Analysis {
  const sym = CURRENCY_SYMBOL[fin.coin_type] ?? fin.coin_type;
  const key = prof.years_of_experience ?? "1-3";
  const [t_junior, t_mid, t_senior, t_expert] = BENCHMARKS[key] ?? BENCHMARKS["1-3"];

  const current = fin.hourly_rate;
  let position: "Bajo" | "Medio" | "Alto";
  let suggested: number;

  if (current < t_mid * 0.9) {
    position = "Bajo";
    suggested = t_mid;
  } else if (current < t_senior * 0.9) {
    position = "Medio";
    suggested = t_senior;
  } else {
    position = "Alto";
    suggested = t_expert;
  }
  suggested = Math.max(suggested, Math.round(current * 1.15));

  const monthly_income = Math.round(current * HOURS_MONTH);
  const monthly_delta = Math.round((suggested - current) * HOURS_MONTH);
  const max_rate = Math.max(t_expert, suggested) * 1.1;

  const bars: MarketBar[] = [
    {
      label: "Tarifa mínima (Junior):",
      value: `${sym}${t_junior}/hora`,
      pct: Math.round((t_junior / max_rate) * 100),
      gradient: "from-pink-400 to-rose-400",
      value_class: "text-pink-600",
    },
    {
      label: "Tarifa promedio (Mid):",
      value: `${sym}${t_mid}/hora`,
      pct: Math.round((t_mid / max_rate) * 100),
      gradient: "from-pink-500 to-purple-500",
      value_class: "text-purple-600",
    },
    {
      label: "Tu tarifa sugerida (Senior):",
      value: `${sym}${suggested}/hora`,
      pct: Math.round((suggested / max_rate) * 100),
      gradient: "from-purple-500 to-purple-600",
      value_class: "text-purple-700",
      bold: true,
    },
    {
      label: "Tarifa premium (Expert):",
      value: `${sym}${t_expert}/hora`,
      pct: Math.round((t_expert / max_rate) * 100),
      gradient: "from-purple-600 to-indigo-600",
      value_class: "text-indigo-600",
    },
  ];

  const interpretation: string[] = [
    `Con ${YEARS_LABEL[key] ?? key} de experiencia, tu tarifa de ${sym}${current}/hora se posiciona en la categoría ${position} del mercado para ${prof.profession}.`,
    position === "Bajo"
      ? `Acción inmediata: Aumentá tu tarifa a ${sym}${suggested}/hora para nuevos clientes. Comunicá el valor adicional que aportás con tu trayectoria.`
      : position === "Medio"
        ? `Tenés margen para subir a ${sym}${suggested}/hora. Presentá casos de éxito y métricas de impacto para justificar el aumento.`
        : `Tu tarifa es competitiva. Para alcanzar ${sym}${suggested}/hora, enfocate en proyectos de alta complejidad y clientes corporativos.`,
    `Mediano plazo (3-6 meses): Especializate en un nicho de mayor valor${prof.specialty ? ` dentro de ${prof.specialty}` : ""}. Los clientes que buscan especialistas pagan tarifas premium.`,
  ];

  const strategy = [
    {
      phase: "Corto plazo (1-3 meses):",
      text: `Alcanzá ${sym}${suggested}/hora para nuevos clientes. Comenzá con 2-3 propuestas al precio sugerido y medí la respuesta del mercado.`,
      shade: "light" as const,
    },
    {
      phase: "Mediano plazo (3-6 meses):",
      text: `Establecé asociaciones con clientes de mayor presupuesto. Construí un portafolio de casos de éxito que justifique la nueva tarifa.`,
      shade: "light" as const,
    },
    {
      phase: "Largo plazo (6+ meses):",
      text: `Alcanzá ${sym}${t_expert}/hora especializándote en servicios de alta complejidad y desarrollando productos o servicios de mayor valor agregado.`,
      shade: "medium" as const,
    },
  ];

  return {
    sym, current_rate: current, suggested_rate: suggested,
    monthly_income, monthly_delta, position,
    years_label: YEARS_LABEL[key] ?? key,
    interpretation, bars, strategy,
  };
}

/* ── Page ── */
export default function AssistantPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [financial, setFinancial] = useState<FinancialConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noConfig, setNoConfig] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw) as { id: string };
    const api = process.env.NEXT_PUBLIC_API_URL;

    Promise.all([
      fetch(`${api}/users/me/${user.id}`).then((r) => r.json()),
      fetch(`${api}/finances/${user.id}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([prof, fin]) => {
        setProfile(prof);
        if (!fin) setNoConfig(true);
        else setFinancial(fin);
      })
      .catch(() => setError("No se pudo cargar la información del perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorCard message={error} />;
  if (noConfig || !financial) return <NoConfigCard />;

  const a = analyze(financial, profile!);

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            ✦ Asistente de Tarifas IA
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Análisis inteligente basado en tu perfil y experiencia
          </p>
        </div>
        <span className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-medium border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Datos cargados desde tu perfil
        </span>
      </div>

      {/* Welcome banner */}
      <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100 flex items-start gap-5">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Award className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Hola, {profile?.full_name ?? "freelancer"} 👋
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            He cargado automáticamente tu información de perfil:{" "}
            <strong className="text-gray-900">{a.years_label} de experiencia</strong> como{" "}
            <strong className="text-gray-900">{profile?.profession}</strong>
            {profile?.country ? ` en ${profile.country}` : ""}. Con tus ingresos estimados de{" "}
            <strong className="text-gray-900">
              {a.sym}{a.monthly_income.toLocaleString()}
            </strong>{" "}
            y tarifa de{" "}
            <strong className="text-gray-900">{a.sym}{a.current_rate}/hora</strong>, he preparado
            un análisis completo para optimizar tus tarifas.
          </p>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Analysis card */}
          <div className="relative bg-gradient-to-br from-purple-500 via-violet-600 to-blue-600 rounded-3xl p-5 text-white shadow-lg overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-block text-xs bg-white/20 text-white/90 px-2.5 py-0.5 rounded-full border border-white/20 mb-4">
                Análisis del Asistente Virtual
              </span>
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <MetricBox label="Tu Tarifa Actual" value={`${a.sym}${a.current_rate}`} sub="/hora" />
                <MetricBox label="Tarifa Sugerida" value={`${a.sym}${a.suggested_rate}`} sub="/hora" />
                <MetricBox
                  label="Potencial Aumento Mensual"
                  value={`+${a.sym}${a.monthly_delta.toLocaleString()}`}
                  sub="por mes"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <p className="text-lg font-bold">{a.years_label}</p>
                  <p className="text-xs text-purple-200 mt-0.5">Experiencia</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {a.sym}{a.monthly_income.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-200 mt-0.5">Ingresos estimados</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{a.position}</p>
                  <p className="text-xs text-purple-200 mt-0.5">Posición de mercado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-green-50 rounded-3xl p-5 border border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">✅</span>
              <h3 className="text-sm font-bold text-gray-900">Recomendaciones Personalizadas</h3>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">• Acción inmediata:</span>{" "}
              Aumentá tu tarifa a {a.sym}{a.suggested_rate}/hora para nuevos clientes
            </p>
          </div>

          {/* Growth Strategy */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🎯</span>
              <h3 className="text-sm font-bold text-gray-900">Estrategia de Crecimiento</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Para maximizar tus ingresos, te recomiendo implementar esta estrategia escalonada:
            </p>
            <div className="space-y-2.5">
              {a.strategy.map((s) => (
                <StrategyBlock key={s.phase} phase={s.phase} shade={s.shade}>
                  {s.text}
                </StrategyBlock>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Interpretation */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-sm">
                ✨
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Interpretación del Asistente Virtual
              </h3>
            </div>
            <ul className="space-y-3.5">
              {a.interpretation.map((text, i) => (
                <InterpBullet key={i}>{text}</InterpBullet>
              ))}
            </ul>
          </div>

          {/* Market Comparison */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-base">📊</span>
              <h3 className="text-sm font-bold text-gray-900">Comparativa de Mercado</h3>
            </div>
            <div className="space-y-4">
              {a.bars.map((bar) => (
                <MarketBarRow key={bar.label} {...bar} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function MetricBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
      <p className="text-xs text-purple-200 leading-tight mb-1.5">{label}</p>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-xs text-purple-300 mt-1">{sub}</p>
    </div>
  );
}

function InterpBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm list-none">
      <div className="mt-1.5 flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 border-purple-500 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
      </div>
      <p className="text-gray-700 leading-relaxed">{children}</p>
    </li>
  );
}

function StrategyBlock({
  phase, shade, children,
}: {
  phase: string; shade: "light" | "medium"; children: React.ReactNode;
}) {
  const bg = shade === "light" ? "bg-amber-50 border-amber-200" : "bg-amber-100 border-amber-300";
  return (
    <div className={`rounded-2xl p-3.5 border ${bg}`}>
      <p className="text-xs font-bold text-gray-800 mb-1">{phase}</p>
      <p className="text-xs text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function MarketBarRow({ label, value, pct, gradient, value_class, bold = false }: MarketBar) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs ${bold ? "font-semibold text-gray-800" : "text-gray-600"}`}>
          {label}
        </span>
        <span className={`text-xs font-bold ${value_class}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center max-w-sm">
        <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
        <p className="text-red-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

function NoConfigCard() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white border-2 border-dashed border-violet-200 rounded-3xl p-12 text-center max-w-md shadow-sm">
        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Settings className="w-8 h-8 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Configurá tu perfil financiero
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Para que el asistente pueda analizar tus tarifas, necesitamos conocer
          tu tarifa horaria actual y moneda de trabajo.
        </p>
        <Link
          href="/finances"
          className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
        >
          Ir a Finanzas <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
