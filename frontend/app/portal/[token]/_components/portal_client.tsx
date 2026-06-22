"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    TrendingUp,
    FileText,
    Circle,
    ChevronDown,
    ChevronUp,
    Download,
    CreditCard,
    CheckCheck,
    Hourglass,
    FileCheck2,
    Check,
    X,
    Loader2,
} from "lucide-react";

interface Task {
    id: string;
    title: string;
    status: string;
}

interface Receipt {
    id: string;
    concept: string;
    amount: number;
    date_emitted: string;
    status: "paid" | "pending" | "cancelled";
}

interface Budget {
    id: string;
    name: string;
    total_amount: number;
    currency: string;
    description?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    responded_at?: string | null;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    state: string;
    progress_percentage: number;
    start_date?: string;
    deadline?: string;
    client_name?: string;
    tasks: Task[];
    receipts: Receipt[];
    budgets: Budget[];
}

interface Props {
    project: Project;
    freelancerName: string;
    token: string;
}

const STATE_LABELS: Record<string, string> = {
    active: "En Progreso",
    in_progress: "En Progreso",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
    pending: "Pendiente",
};

const TASK_STATUS_LABELS: Record<string, string> = {
    "Completada": "Completada",
    "En Progreso": "En progreso",
    "Pendiente": "Pendiente",
    "Bloqueada": "Bloqueada",
};

const RECEIPT_STATUS_LABELS: Record<string, string> = {
    paid: "Pagado",
    pending: "Pendiente",
    cancelled: "Cancelado",
};

const BUDGET_STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente de respuesta",
    approved: "Aprobado",
    rejected: "Rechazado",
};

const CURRENCY_SYMBOL: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", ARS: "$", MXN: "$", BRL: "R$",
};

function taskIcon(status: string) {
    if (status === "Completada")
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (status === "En Progreso")
        return <Clock className="w-5 h-5 text-yellow-300" />;
    if (status === "Bloqueada")
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <Circle className="w-5 h-5 text-white/30" />;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function formatAmount(amount: number) {
    return amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
}

function daysRemaining(deadline?: string) {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map(Number);
    const deadlineDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function handleDownloadPDF(receipt: Receipt, projectName: string, freelancerName: string) {
    const shortId = receipt.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Recibo #${shortId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Inter', Arial, sans-serif; background: #f5f3ff; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }
    .card { background: white; border-radius: 20px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 20px 60px rgba(109,40,217,0.15); }
    .card-header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 28px 28px 24px; }
    .receipt-label { color: #ddd6fe; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
    .receipt-id { color: white; font-size: 26px; font-weight: 900; letter-spacing: 0.04em; font-variant-numeric: tabular-nums; }
    .badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 5px 14px; }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; }
    .badge-text { color: white; font-size: 12px; font-weight: 600; }
    .card-body { padding: 24px 28px; }
    .field-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px; }
    .field-value { font-size: 14px; color: #111827; font-weight: 500; }
    .dash { border: none; border-top: 1px dashed #e5e7eb; margin: 18px 0; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .concept-text { font-size: 14px; color: #374151; line-height: 1.5; }
    .bottom-row { display: flex; align-items: flex-end; justify-content: space-between; }
    .amount-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px; text-align: right; }
    .amount-value { font-size: 32px; font-weight: 900; color: #111827; line-height: 1; text-align: right; }
    .footer { padding: 16px 28px; background: #faf5ff; border-top: 1px solid #f3e8ff; text-align: center; font-size: 11px; color: #a78bfa; }
    @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { background: white; padding: 0; }
        .card { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="receipt-label">Recibo</div>
      <div class="receipt-id">#${shortId}</div>
      <div class="badge">
        <div class="badge-dot"></div>
        <div class="badge-text">Cobrado</div>
      </div>
    </div>
    <div class="card-body">
      <div style="margin-bottom:18px">
        <div class="field-label">Emitido por</div>
        <div class="field-value">${freelancerName}</div>
      </div>
      <hr class="dash" />
      <div class="grid2" style="margin-bottom:18px">
        <div>
          <div class="field-label">Proyecto</div>
          <div class="field-value">${projectName}</div>
        </div>
      </div>
      <hr class="dash" />
      <div style="margin-bottom:18px">
        <div class="field-label">Concepto</div>
        <div class="concept-text">${receipt.concept}</div>
      </div>
      <hr class="dash" />
      <div class="bottom-row">
        <div>
          <div class="field-label">Fecha de emisión</div>
          <div class="field-value">${formatDate(receipt.date_emitted)}</div>
        </div>
        <div>
          <div class="amount-label">Total</div>
          <div class="amount-value">${formatAmount(receipt.amount)}</div>
        </div>
      </div>
    </div>
    <div class="footer">Documento generado desde el portal de cliente · ${freelancerName}</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
}

export default function PortalClient({ project, freelancerName, token }: Props) {
    const [tasksExpanded, setTasksExpanded] = useState(true);
    const [paymentsExpanded, setPaymentsExpanded] = useState(true);
    const [budgetsExpanded, setBudgetsExpanded] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>(project.budgets ?? []);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [respondError, setRespondError] = useState<string | null>(null);

    const tasks = project.tasks ?? [];
    const receipts = project.receipts ?? [];

    async function handleRespond(budgetId: string, decision: "approved" | "rejected") {
        if (decision === "rejected" && !window.confirm("¿Seguro que querés rechazar este presupuesto?")) {
            return;
        }
        setRespondingId(budgetId);
        setRespondError(null);
        try {
            const res = await fetch(`/api/portal/${token}/budgets/${budgetId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || data.error || "No se pudo registrar la respuesta");
            setBudgets((prev) => prev.map((b) => (b.id === budgetId ? data : b)));
        } catch (err) {
            setRespondError(err instanceof Error ? err.message : "Error al responder el presupuesto");
        } finally {
            setRespondingId(null);
        }
    }

    const completedTasks = tasks.filter((t) => t.status === "Completada").length;
    const inProgressTasks = tasks.filter((t) => t.status === "En Progreso").length;
    const pendingTasks = tasks.filter(
        (t) => t.status !== "Completada" && t.status !== "En Progreso"
    ).length;

    const totalPaid = receipts.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
    const totalPending = receipts.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);

    const days = daysRemaining(project.deadline);
    const daysLabel =
        days === null ? "—"
            : days < 0 ? `${Math.abs(days)} días vencido`
                : days === 0 ? "Hoy"
                    : `${days} días restantes`;
    const daysColor = days !== null && days < 7 ? "text-red-300" : "text-indigo-200";

    return (
        <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 40%, #4a0a3e 70%, #2d0a2a 100%)" }}>

            {/* Header */}
            <div className="border-b border-white/10 backdrop-blur-sm bg-white/5">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            O
                        </div>
                        <span className="text-white/80 text-sm font-medium">
                            Orgalancer · Portal del Cliente
                        </span>
                    </div>
                    <span className="text-white/40 text-xs">Solo lectura</span>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

                {/* Project hero */}
                <div className="rounded-2xl p-6 border border-white/10" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.15) 100%)", backdropFilter: "blur(12px)" }}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            {project.client_name && (
                                <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">
                                    Proyecto para {project.client_name}
                                </p>
                            )}
                            <h1 className="text-2xl font-bold text-white leading-tight">{project.name}</h1>
                            {project.description && (
                                <p className="text-white/60 text-sm mt-1">{project.description}</p>
                            )}
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${project.state === "active" || project.state === "in_progress"
                            ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                            : project.state === "completed"
                                ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
                                : "bg-white/10 text-white/60 border border-white/20"
                            }`}>
                            {STATE_LABELS[project.state] ?? project.state}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/60 text-sm">Progreso general</span>
                            <span className="text-white font-semibold">{project.progress_percentage ?? 0}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-white/10">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${project.progress_percentage ?? 0}%`, background: "linear-gradient(90deg, #a855f7, #6366f1)" }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Stat label="Inicio" value={formatDate(project.start_date)} icon={<Calendar className="w-4 h-4" />} />
                        <Stat label="Entrega estimada" value={formatDate(project.deadline)} icon={<Calendar className="w-4 h-4" />} />
                        <Stat label="Tiempo restante" value={daysLabel} icon={<Clock className="w-4 h-4" />} valueClass={daysColor} />
                        <Stat label="Tareas completadas" value={`${completedTasks} / ${tasks.length}`} icon={<TrendingUp className="w-4 h-4" />} />
                    </div>
                </div>

                {/* Budgets */}
                {budgets.length > 0 && (
                    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
                        <button
                            onClick={() => setBudgetsExpanded((p) => !p)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileCheck2 className="w-5 h-5 text-purple-300" />
                                <span className="text-white font-semibold">Presupuestos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-white/40 text-xs">
                                    {budgets.filter((b) => b.status === "pending").length} pendientes
                                </span>
                                {budgetsExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                            </div>
                        </button>

                        {budgetsExpanded && (
                            <div className="divide-y divide-white/5">
                                {respondError && (
                                    <p className="text-red-300 text-xs px-6 py-2 bg-red-500/10">{respondError}</p>
                                )}
                                {budgets.map((budget) => {
                                    const symbol = CURRENCY_SYMBOL[budget.currency] ?? budget.currency;
                                    const isResponding = respondingId === budget.id;
                                    return (
                                        <div key={budget.id} className="flex items-start justify-between gap-4 px-6 py-4 bg-white/5 mx-3 mb-2 rounded-xl border border-white/10">
                                            <div className="min-w-0">
                                                <p className="text-white/90 text-sm font-medium truncate">{budget.name}</p>
                                                {budget.description && (
                                                    <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{budget.description}</p>
                                                )}
                                                <p className="text-white font-semibold text-sm mt-1.5">{symbol}{formatAmount(budget.total_amount)}</p>
                                                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${budget.status === "approved"
                                                    ? "bg-green-500/20 text-green-300"
                                                    : budget.status === "rejected"
                                                        ? "bg-red-500/20 text-red-300"
                                                        : "bg-yellow-500/20 text-yellow-300"
                                                    }`}>
                                                    {BUDGET_STATUS_LABELS[budget.status] ?? budget.status}
                                                </span>
                                            </div>

                                            {budget.status === "pending" && (
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleRespond(budget.id, "approved")}
                                                        disabled={isResponding}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium transition-colors border border-green-500/30 disabled:opacity-50"
                                                    >
                                                        {isResponding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(budget.id, "rejected")}
                                                        disabled={isResponding}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors border border-red-500/30 disabled:opacity-50"
                                                    >
                                                        {isResponding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Payment history */}
                {receipts.length > 0 && (
                    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
                        <button
                            onClick={() => setPaymentsExpanded((p) => !p)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-purple-300" />
                                <span className="text-white font-semibold">Historial de pagos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-white/40 text-xs">
                                    Pagado: <span className="text-green-300 font-medium">€{formatAmount(totalPaid)}</span>
                                    {totalPending > 0 && <> · Pendiente: <span className="text-yellow-300 font-medium">€{formatAmount(totalPending)}</span></>}
                                </span>
                                {paymentsExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                            </div>
                        </button>

                        {paymentsExpanded && (
                            <div className="divide-y divide-white/5">
                                {receipts.map((receipt) => (
                                    <div key={receipt.id} className="flex items-center justify-between px-6 py-4 gap-4 bg-white/5 mx-3 mb-2 rounded-xl border border-white/10"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {receipt.status === "paid"
                                                ? <CheckCheck className="w-5 h-5 text-green-400 shrink-0" />
                                                : receipt.status === "cancelled"
                                                    ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                    : <Hourglass className="w-5 h-5 text-yellow-300 shrink-0" />
                                            }
                                            <div className="min-w-0">
                                                <p className="text-white/90 text-sm font-medium truncate">{receipt.concept}</p>
                                                <p className="text-white/40 text-xs mt-0.5">Emitido: {formatDate(receipt.date_emitted)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <p className="text-white font-semibold text-sm">€{formatAmount(receipt.amount)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${receipt.status === "paid"
                                                    ? "bg-green-500/20 text-green-300"
                                                    : receipt.status === "cancelled"
                                                        ? "bg-red-500/20 text-red-300"
                                                        : "bg-yellow-500/20 text-yellow-300"
                                                    }`}>
                                                    {RECEIPT_STATUS_LABELS[receipt.status]}
                                                </span>
                                            </div>
                                            {receipt.status === "paid" && (
                                                <button
                                                    onClick={() => handleDownloadPDF(receipt, project.name, freelancerName)}
                                                    title="Descargar recibo PDF"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium transition-colors border border-purple-500/30"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tasks */}
                {tasks.length > 0 && (
                    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}>
                        <button
                            onClick={() => setTasksExpanded((p) => !p)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-300" />
                                <span className="text-white font-semibold">Avance de tareas</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-white/40 text-xs">
                                    {completedTasks} completadas · {inProgressTasks} en progreso · {pendingTasks} pendientes
                                </span>
                                {tasksExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                            </div>
                        </button>

                        {tasksExpanded && (
                            <div className="divide-y divide-white/5">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between px-6 py-3.5 bg-white/5 mx-3 mb-2 rounded-xl border border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            {taskIcon(task.status)}
                                            <span className={`text-sm ${task.status === "Completada" ? "line-through text-white/40" : "text-white/80"}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === "Completada"
                                            ? "bg-green-500/20 text-green-300"
                                            : task.status === "En Progreso"
                                                ? "bg-yellow-500/20 text-yellow-300"
                                                : task.status === "Bloqueada"
                                                    ? "bg-red-500/20 text-red-300"
                                                    : "bg-white/10 text-white/40"
                                            }`}>
                                            {TASK_STATUS_LABELS[task.status] ?? task.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-3xl mx-auto px-4 pb-8 text-center">
                <p className="text-white/20 text-xs">
                    Portal generado en <span className="text-white/40 font-medium">Orgalancer</span> · Solo lectura para el cliente
                </p>
            </div>
        </div>
    );
}

function Stat({ label, value, icon, valueClass = "text-white" }: {
    label: string; value: string; icon?: React.ReactNode; valueClass?: string;
}) {
    return (
        <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">{icon}{label}</div>
            <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
        </div>
    );
}