"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, FileText, Loader2, Sparkles, FolderPlus } from "lucide-react";

interface UserFinancial {
  hourly_rate: number;
  coin_type: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$", MXN: "$", BRL: "R$",
};

// ── Inline markdown renderer ──────────────────────────────────────────────────

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
            <tr className="bg-indigo-50">
              {tableHeaders.map((h, i) => (
                <th key={i} className="text-left px-4 py-2 text-xs font-semibold text-indigo-700 border border-gray-200">
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

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const cells = line.split("|").slice(1, -1);
      const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
      if (isSeparator) continue;
      if (!inTable) { inTable = true; tableHeaders = cells; }
      else { tableRows.push(cells); }
      continue;
    }

    if (inTable) flushTable();

    if (line.startsWith("### ")) {
      nodes.push(
        <div key={key++} className="flex items-center gap-2 mt-5 mb-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          <h3 className="text-sm font-bold text-gray-900">{line.slice(4)}</h3>
        </div>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="text-base font-bold text-gray-900 mt-5 mb-2">{line.slice(3)}</h2>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      nodes.push(
        <div key={key++} className="flex gap-2 py-0.5">
          <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
          <p className="text-sm text-gray-700">{renderInline(line.slice(2))}</p>
        </div>
      );
      continue;
    }

    if (line.trim() === "") { nodes.push(<div key={key++} className="h-1" />); continue; }

    nodes.push(
      <p key={key++} className="text-sm text-gray-700 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  if (inTable) flushTable();

  return (
    <div className="px-6 py-4">
      {nodes}
      {streaming && (
        <span className="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

export default function BudgetModal({ open, onClose, onProjectCreated }: Props) {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [profession, setProfession] = useState("Freelancer");
  const resultRef = useRef<HTMLDivElement>(null);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projectForm, setProjectForm] = useState({
    name: "", estimated_budget: "",
    clientMode: "existing" as "existing" | "new",
    client_id: "",
    newClientName: "", newClientEmail: "", newClientType: "empresa",
  });
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectSuccess, setProjectSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
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

    fetch("/api/clients", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setClients(data.map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, [open]);

  // Auto-fill monto al terminar de generar
  useEffect(() => {
    if (!streaming && result) {
      const match = result.match(/\*\*Total[:\s]+[^\d]*(\d[\d.,\s]*)/i);
      if (match) {
        const digits = match[1].replace(/[^\d]/g, "");
        if (digits) setProjectForm((p) => ({ ...p, estimated_budget: digits }));
      }
    }
  }, [streaming, result]);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  function handleClose() {
    if (streaming) return;
    setDescription("");
    setResult("");
    setError(null);
    onClose();
  }

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

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectForm.name.trim() || !projectForm.estimated_budget) {
      setProjectError("Nombre y presupuesto son obligatorios.");
      return;
    }
    if (projectForm.clientMode === "new" && (!projectForm.newClientName.trim() || !projectForm.newClientEmail.trim())) {
      setProjectError("Nombre y email del cliente son obligatorios.");
      return;
    }
    setProjectSaving(true);
    setProjectError(null);
    try {
      let clientId = projectForm.client_id || null;
      if (projectForm.clientMode === "new") {
        const cRes = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: projectForm.newClientName.trim(),
            email: projectForm.newClientEmail.trim(),
            client_type: projectForm.newClientType,
          }),
        });
        if (!cRes.ok) throw new Error("Error al crear el cliente");
        clientId = (await cRes.json()).id;
      }

      const pRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectForm.name.trim(),
          estimated_budget: parseFloat(projectForm.estimated_budget),
          contract_type: "fixed_price",
          client_id: clientId,
        }),
      });
      if (!pRes.ok) throw new Error("Error al crear el proyecto");

      setProjectSuccess(true);
      onProjectCreated?.();
    } catch (err) {
      setProjectError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setProjectSaving(false);
    }
  }

  if (!open) return null;

  const currencySymbol = CURRENCY_SYMBOL[currency] ?? currency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Sparkles size={15} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Generar Presupuesto con IA</h2>
              {hourlyRate && (
                <p className="text-xs text-indigo-600 font-medium">
                  Tarifa: {currencySymbol}{hourlyRate.toLocaleString("es-ES")}/hora
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={streaming}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-6 border-b border-gray-100">
            {!hourlyRate && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                Sin tarifa horaria configurada — andá a Finanzas para configurarla.
              </p>
            )}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describí el trabajo... ej: 'Diseño y desarrollo de un sitio web con carrito de compras, pasarela de pago y panel de administración.'"
              className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-300"
              disabled={streaming}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{description.length} caracteres</span>
              <button
                type="submit"
                disabled={!description.trim() || streaming || !hourlyRate}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {streaming ? (
                  <><Loader2 size={14} className="animate-spin" /> Generando...</>
                ) : (
                  <><Send size={14} /> Generar presupuesto</>
                )}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </form>

          {/* Result */}
          {(result || streaming) && (
            <div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
                <FileText size={14} className="text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Presupuesto generado</span>
                {streaming && <Loader2 size={11} className="animate-spin text-gray-400 ml-auto" />}
              </div>
              <div ref={resultRef}>
                <MarkdownResult text={result} streaming={streaming} />
              </div>
            </div>
          )}
        </div>

        {/* Project creation form */}
        {showProjectForm && result && !streaming && (
          <form id="budget-project-form" onSubmit={handleCreateProject} className="px-6 py-4 border-t border-gray-100 space-y-3 flex-shrink-0 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700">Crear proyecto desde este presupuesto</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre del proyecto *</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ej: Sitio web"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Presupuesto ({currencySymbol}) *</label>
                <input
                  type="number"
                  min={0}
                  value={projectForm.estimated_budget}
                  onChange={(e) => setProjectForm((p) => ({ ...p, estimated_budget: e.target.value }))}
                  placeholder="ej: 1500"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              {(["existing", "new"] as const).map((mode) => (
                <button key={mode} type="button"
                  onClick={() => setProjectForm((p) => ({ ...p, clientMode: mode }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    projectForm.clientMode === mode ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                  }`}
                >
                  {mode === "existing" ? "Cliente existente" : "Nuevo cliente"}
                </button>
              ))}
            </div>
            {projectForm.clientMode === "existing" ? (
              <select
                value={projectForm.client_id}
                onChange={(e) => setProjectForm((p) => ({ ...p, client_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Sin cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Nombre *" value={projectForm.newClientName}
                  onChange={(e) => setProjectForm((p) => ({ ...p, newClientName: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                <input type="email" placeholder="Email *" value={projectForm.newClientEmail}
                  onChange={(e) => setProjectForm((p) => ({ ...p, newClientEmail: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
                <select value={projectForm.newClientType}
                  onChange={(e) => setProjectForm((p) => ({ ...p, newClientType: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="empresa">Empresa</option>
                  <option value="persona">Persona</option>
                </select>
              </div>
            )}
            {projectError && <p className="text-xs text-red-500">{projectError}</p>}
            {projectSuccess && <p className="text-xs text-green-600 font-medium">✓ Proyecto creado correctamente.</p>}
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={streaming}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition disabled:opacity-40"
          >
            Cerrar
          </button>
          {result && !streaming && !projectSuccess && (
            <button
              onClick={() => showProjectForm
                ? (document.getElementById("budget-project-form") as HTMLFormElement)?.requestSubmit()
                : setShowProjectForm(true)
              }
              disabled={projectSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-md disabled:opacity-50 transition"
            >
              {projectSaving ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
              {projectSaving ? "Creando..." : "Crear proyecto desde presupuesto"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
