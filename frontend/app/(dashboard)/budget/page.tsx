"use client";

import { useState, useEffect, useRef } from "react";
import { Send, FileText, Loader2, Pencil, Eye, Save, Mail } from "lucide-react";

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
  const [editing, setEditing] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [profession, setProfession] = useState("Freelancer");
  const resultRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [editingHtml, setEditingHtml] = useState("");

  const [saveForm, setSaveForm] = useState({
    name: "", total_amount: "",
    clientMode: "existing" as "existing" | "new",
    client_id: "",
    newClientName: "", newClientEmail: "", newClientType: "empresa",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const [savedBudgets, setSavedBudgets] = useState<{
    id: string; name: string; total_amount: number; currency: string;
    client_name: string | null; project_name: string | null; created_at: string;
  }[]>([]);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    if (user.profession) setProfession(user.profession);

    fetch(`/api/finances`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: UserFinancial | null) => {
        if (data?.hourly_rate) setHourlyRate(data.hourly_rate);
        if (data?.coin_type) setCurrency(data.coin_type);
      })
      .catch(() => {});
  }, []);

  async function handleSend(id: string) {
    setSendingId(id);
    try {
      const res = await fetch(`/api/budgets/${id}/send`, { method: "POST" });
      if (res.ok) setSentIds((prev) => new Set([...prev, id]));
    } finally {
      setSendingId(null);
    }
  }

  function loadSavedBudgets() {
    fetch("/api/budgets", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setSavedBudgets(data))
      .catch(() => {});
  }

  useEffect(() => {
    fetch("/api/clients", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setClients(data.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
    loadSavedBudgets();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const totalAmount = parseFloat(saveForm.total_amount);
    if (!saveForm.name.trim() || !totalAmount) {
      setSaveError("Nombre y monto son obligatorios.");
      return;
    }
    if (saveForm.clientMode === "new" && (!saveForm.newClientName.trim() || !saveForm.newClientEmail.trim())) {
      setSaveError("Nombre y email del cliente son obligatorios.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // 1. Crear cliente nuevo si corresponde
      let clientId = saveForm.client_id || null;
      if (saveForm.clientMode === "new") {
        const cRes = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:        saveForm.newClientName.trim(),
            email:       saveForm.newClientEmail.trim(),
            client_type: saveForm.newClientType,
          }),
        });
        if (!cRes.ok) throw new Error("Error al crear el cliente");
        const cData = await cRes.json();
        clientId = cData.id;
      }

      // 2. Crear proyecto a partir del presupuesto
      const pRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:             saveForm.name.trim(),
          estimated_budget: totalAmount,
          contract_type:    "fixed_price",
          client_id:        clientId,
          description:      description.trim() || null,
        }),
      });
      if (!pRes.ok) throw new Error("Error al crear el proyecto");
      const pData = await pRes.json();

      // 3. Guardar presupuesto formal
      const bRes = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         saveForm.name.trim(),
          total_amount: totalAmount,
          currency,
          description:  description.trim() || null,
          client_id:    clientId,
          project_id:   pData.id,
        }),
      });
      if (!bRes.ok) throw new Error((await bRes.json()).error);

      setSaveSuccess(true);
      setSaveForm({ name: "", total_amount: "", clientMode: "existing", client_id: "", newClientName: "", newClientEmail: "", newClientType: "empresa" });
      loadSavedBudgets();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  // Auto-fill monto cuando termina el streaming
  useEffect(() => {
    if (!streaming && result) {
      const patterns = [
        /\*\*Total[:\s]+[^\d]*(\d[\d.,\s]*)/i,
        /Total[:\s]+[^\d]*(\d[\d.,\s]*)/i,
      ];
      for (const pattern of patterns) {
        const match = result.match(pattern);
        if (match) {
          const raw = match[1].trim();
          const withoutDecimals = raw.replace(/[.,]\d{1,2}$/, "");
          const digits = withoutDecimals.replace(/[^\d]/g, "");
          if (digits && parseInt(digits) > 0) {
            setSaveForm((p) => ({ ...p, total_amount: digits }));
            break;
          }
        }
      }
    }
  }, [streaming, result]);

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

  function recalculate(container: HTMLDivElement) {
    const table = container.querySelector("table");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    let totalHours = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) return;
      if ((cells[0].textContent ?? "").toLowerCase().includes("total")) return;
      const match = (cells[1].textContent ?? "").match(/(\d+(?:[.,]\d+)?)/);
      if (match) totalHours += parseFloat(match[1].replace(",", "."));
    });

    // Actualizar fila total en tabla
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) return;
      if ((cells[0].textContent ?? "").toLowerCase().includes("total")) {
        cells[1].innerHTML = `<strong>${totalHours} horas</strong>`;
      }
    });

    // Leer tarifa horaria desde el contenido editable si fue modificada
    let effectiveRate = hourlyRate ?? 0;
    container.querySelectorAll("p, span, li, div").forEach((el) => {
      if (el.children.length === 0 && (el.textContent ?? "").includes("Tarifa horaria:")) {
        const match = (el.textContent ?? "").match(/(\d+(?:[.,]\d+)?)/);
        if (match) effectiveRate = parseFloat(match[1].replace(",", "."));
      }
    });

    // Actualizar monto total
    const totalAmount = Math.round(totalHours * effectiveRate);
    container.querySelectorAll("strong, b").forEach((el) => {
      if ((el.textContent ?? "").includes("Total:")) {
        el.textContent = `Total: ${currencySymbol}${totalAmount.toLocaleString("es-ES")}`;
      }
    });

    // Actualizar línea de horas totales estimadas
    container.querySelectorAll("p, span, li").forEach((el) => {
      if (el.children.length === 0 && (el.textContent ?? "").includes("Horas totales estimadas:")) {
        el.textContent = `Horas totales estimadas: ${totalHours} horas`;
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Presupuestos guardados */}
      {savedBudgets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-800 mb-3">Presupuestos formales</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {savedBudgets.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400">
                    {[b.client_name, b.project_name].filter(Boolean).join(" · ") || "Sin cliente ni proyecto"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">
                    {CURRENCY_SYMBOL[b.currency] ?? b.currency}{b.total_amount.toLocaleString("es-ES")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => handleSend(b.id)}
                  disabled={sendingId === b.id || sentIds.has(b.id)}
                  title={sentIds.has(b.id) ? "Enviado" : b.client_name ? `Enviar a ${b.client_name}` : "Sin cliente asignado"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition flex-shrink-0 ${
                    sentIds.has(b.id)
                      ? "bg-green-50 text-green-600 cursor-default"
                      : b.client_name
                      ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {sendingId === b.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <Mail size={12} />}
                  {sentIds.has(b.id) ? "Enviado" : "Enviar"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {streaming  ? <Loader2 size={12} className="animate-spin text-gray-400 ml-auto" />
              : (
                <button
                  onClick={() => {
                    if (!editing) {
                      setEditingHtml(previewRef.current?.innerHTML ?? "");
                    } else {
                      setEditingHtml(editRef.current?.innerHTML ?? editingHtml);
                    }
                    setEditing((v) => !v);
                  }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                >
                  {editing ? <><Eye size={13} /> Vista previa</> : <><Pencil size={13} /> Editar</>}
                </button>
              )
            }
          </div>
          <div ref={resultRef} className="max-h-[65vh] overflow-y-auto">
            {editing ? (
              <div
                ref={editRef}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: editingHtml }}
                onInput={(e) => recalculate(e.currentTarget as HTMLDivElement)}
                className="px-6 py-5 text-sm text-gray-700 focus:outline-none
                  [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                  [&_th]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-green-700 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-green-50
                  [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:border [&_td]:border-gray-200
                  [&_tr:nth-child(even)]:bg-gray-50 [&_strong]:font-semibold [&_strong]:text-gray-900"
              />
            ) : editingHtml ? (
              <div
                ref={previewRef}
                dangerouslySetInnerHTML={{ __html: editingHtml }}
                className="px-6 py-5 text-sm text-gray-700
                  [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                  [&_th]:text-left [&_th]:px-4 [&_th]:py-2 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-green-700 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-green-50
                  [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:border [&_td]:border-gray-200
                  [&_tr:nth-child(even)]:bg-gray-50 [&_strong]:font-semibold [&_strong]:text-gray-900"
              />
            ) : (
              <div ref={previewRef}>
                <MarkdownResult text={result} streaming={streaming} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save form */}
      {result && !streaming && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Guardar como presupuesto formal</h3>
          <form onSubmit={handleSave} className="space-y-4">

            {/* Nombre + Monto */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del presupuesto *</label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ej: Sitio web para cliente X"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monto total ({currencySymbol}) *</label>
                <input
                  type="number"
                  min={0}
                  value={saveForm.total_amount}
                  onChange={(e) => setSaveForm((p) => ({ ...p, total_amount: e.target.value }))}
                  placeholder="ej: 1500"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
            </div>

            {/* Toggle cliente */}
            <div>
              <div className="flex gap-2 mb-3">
                {(["existing", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSaveForm((p) => ({ ...p, clientMode: mode }))}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                      saveForm.clientMode === mode
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {mode === "existing" ? "Cliente existente" : "Nuevo cliente"}
                  </button>
                ))}
              </div>

              {saveForm.clientMode === "existing" ? (
                <select
                  value={saveForm.client_id}
                  onChange={(e) => setSaveForm((p) => ({ ...p, client_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <option value="">Sin cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={saveForm.newClientName}
                      onChange={(e) => setSaveForm((p) => ({ ...p, newClientName: e.target.value }))}
                      placeholder="Nombre del cliente"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                    <input
                      type="email"
                      value={saveForm.newClientEmail}
                      onChange={(e) => setSaveForm((p) => ({ ...p, newClientEmail: e.target.value }))}
                      placeholder="email@cliente.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                    <select
                      value={saveForm.newClientType}
                      onChange={(e) => setSaveForm((p) => ({ ...p, newClientType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      <option value="empresa">Empresa</option>
                      <option value="persona">Persona</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Se creará automáticamente un proyecto con el nombre y monto del presupuesto.
            </p>

            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
            {saveSuccess && <p className="text-xs text-green-600 font-medium">✓ Presupuesto, cliente y proyecto guardados correctamente.</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Guardando..." : "Guardar presupuesto formal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
