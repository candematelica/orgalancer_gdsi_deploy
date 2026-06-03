"use client";

import { useState, useEffect, useRef } from "react";
import { Send, FileText, Loader2 } from "lucide-react";

interface UserFinancial {
  hourly_rate: number;
  coin_type: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$", MXN: "$", BRL: "R$",
};

// ── Markdown renderer (no external deps) ──────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  );
}

function MarkdownResult({ text, streaming }: { text: string; streaming: boolean }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inTable = false;
  let key = 0;

  function flushTable() {
    if (!tableHeaders.length) return;
    nodes.push(
      <div key={key++} className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-green-50">
              {tableHeaders.map((h, i) => (
                <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-green-700 border border-gray-200">
                  {renderInline(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-gray-700 border border-gray-200">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableHeaders = [];
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const cells = line.split("|").slice(1, -1);
      const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
      if (isSeparator) continue;
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable) flushTable();

    // h3
    if (line.startsWith("### ")) {
      nodes.push(
        <div key={key++} className="flex items-center gap-2 mt-6 mb-2">
          <div className="w-1 h-5 bg-green-500 rounded-full" />
          <h3 className="text-sm font-bold text-gray-900">{line.slice(4)}</h3>
        </div>
      );
      continue;
    }

    // h2
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="text-base font-bold text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>
      );
      continue;
    }

    // bullet
    if (line.startsWith("- ") || line.startsWith("* ")) {
      nodes.push(
        <div key={key++} className="flex gap-2 py-0.5">
          <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
          <p className="text-sm text-gray-700">{renderInline(line.slice(2))}</p>
        </div>
      );
      continue;
    }

    // empty line
    if (line.trim() === "") {
      nodes.push(<div key={key++} className="h-1" />);
      continue;
    }

    // plain paragraph
    nodes.push(
      <p key={key++} className="text-sm text-gray-700 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  if (inTable) flushTable();

  return (
    <div className="px-6 py-5">
      {nodes}
      {streaming && (
        <span className="inline-block w-1.5 h-4 bg-green-500 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [profession, setProfession] = useState("Freelancer");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    if (user.profession) setProfession(user.profession);

    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/finances/${user.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: UserFinancial | null) => {
        if (data?.hourly_rate) setHourlyRate(data.hourly_rate);
        if (data?.coin_type) setCurrency(data.coin_type);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || streaming) return;
    if (!hourlyRate) {
      setError("Configurá tu tarifa horaria en Finanzas antes de generar un presupuesto.");
      return;
    }

    setResult("");
    setError(null);
    setStreaming(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: description.trim(),
          hourly_rate: hourlyRate,
          currency,
          profession,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Error al conectar con el servidor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6);
          if (chunk === "[DONE]") { setStreaming(false); break; }
          if (chunk.startsWith("[ERROR]")) { setError(chunk.slice(8)); setStreaming(false); break; }
          setResult((prev) => prev + chunk.replace(/\\n/g, "\n"));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setStreaming(false);
    }
  }

  const currencySymbol = CURRENCY_SYMBOL[currency] ?? currency;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generador de Presupuestos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Describí el trabajo en lenguaje natural y Claude generará un presupuesto detallado.
        </p>
        {hourlyRate ? (
          <p className="text-xs text-green-600 mt-1 font-medium">
            Tarifa horaria: {currencySymbol}{hourlyRate.toLocaleString("es-ES")}/hora
          </p>
        ) : (
          <p className="text-xs text-amber-500 mt-1">
            Sin tarifa horaria configurada — andá a Finanzas para configurarla.
          </p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describí el trabajo... ej: 'Necesito diseñar y desarrollar un sitio web para una tienda de ropa con carrito de compras, pasarela de pago y panel de administración para gestionar productos e inventario.'"
            className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none"
            disabled={streaming}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{description.length} caracteres</span>
            <button
              type="submit"
              disabled={!description.trim() || streaming || !hourlyRate}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {streaming ? (
                <><Loader2 size={14} className="animate-spin" /> Generando...</>
              ) : (
                <><Send size={14} /> Generar presupuesto</>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Result */}
      {(result || streaming) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <FileText size={15} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-800">Presupuesto generado</span>
            {streaming && <Loader2 size={12} className="animate-spin text-gray-400 ml-auto" />}
          </div>
          <div ref={resultRef} className="max-h-[65vh] overflow-y-auto">
            <MarkdownResult text={result} streaming={streaming} />
          </div>
        </div>
      )}
    </div>
  );
}
