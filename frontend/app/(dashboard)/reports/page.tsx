"use client";

import { useState, useEffect } from "react";
import { useReports } from "./_hooks/use_reports";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  RefreshCw,
  Clock,
  Briefcase,
  DollarSign,
  FileText,
  Calculator,
  SlidersHorizontal
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart
} from "recharts";
import SectionHeader from "../_components/section_header";

const FILTER_SELECT = "px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer w-full md:w-auto min-w-[160px]";
const DATE_INPUT = "px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer w-full md:w-auto";
const BTN_PRIMARY = "px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow flex items-center justify-center gap-2";
const BTN_GHOST = "px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 bg-white";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"cash-flow" | "profitability">("cash-flow");

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const { cashFlow, profitability, loading, error, fetchCashFlow, fetchProfitability } = useReports();

  useEffect(() => {
    fetch("/api/clients", { cache: "no-store" }).then(r => r.json()).then(setClients).catch(() => { });
    fetch("/api/projects", { cache: "no-store" }).then(r => r.json()).then(setProjects).catch(() => { });
    fetch("/api/expenses/categories", { cache: "no-store" }).then(r => r.json()).then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    if (activeTab === "cash-flow") {
      fetchCashFlow({ client_id: clientId, project_id: projectId, category_id: categoryId, start_date: startDate, end_date: endDate });
    } else {
      fetchProfitability({ client_id: clientId, project_id: projectId, category_id: categoryId });
    }
  };

  const handleClearFilters = () => {
    setClientId("");
    setProjectId("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    if (activeTab === "cash-flow") {
      fetchCashFlow({});
    } else {
      fetchProfitability({});
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="pb-8">
      <SectionHeader
        title="Reportes Financieros"
        subtitle="Analiza tu flujo de caja y la rentabilidad de tus proyectos"
        icon={<BarChart3 className="w-8 h-8 text-violet-600" />}
      />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "cash-flow" ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("cash-flow")}
        >
          Flujo de Caja
        </button>
        <button
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "profitability" ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("profitability")}
        >
          Rentabilidad por Proyecto
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
          <SlidersHorizontal size={14} />
          <span>Filtros</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className={FILTER_SELECT}>
            <option value="">Todos los Clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={projectId} onChange={e => setProjectId(e.target.value)} className={FILTER_SELECT}>
            <option value="">Todos los Proyectos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={FILTER_SELECT}>
            <option value="">Todas las Categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {activeTab === "cash-flow" && (
            <>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={DATE_INPUT} title="Fecha de Inicio" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={DATE_INPUT} title="Fecha Fin" />
            </>
          )}

          <div className="flex gap-2 ml-auto">
            <button onClick={loadData} className={BTN_PRIMARY}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Filtrar
            </button>
            <button onClick={handleClearFilters} className={BTN_GHOST}>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6">
          <p className="text-red-700 font-medium">Error al cargar datos: {error}</p>
        </div>
      )}

      {/* Cash Flow Content */}
      {!loading && !error && activeTab === "cash-flow" && cashFlow && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:bg-violet-50/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(cashFlow.total_income)}</h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:bg-violet-50/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingDown size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gastos Totales</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(cashFlow.total_expenses)}</h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:bg-violet-50/30 transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${cashFlow.net_balance >= 0 ? 'bg-violet-50 text-violet-600' : 'bg-orange-50 text-orange-500'}`}>
                <Wallet size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balance Neto</p>
                <h3 className={`text-xl font-bold mt-1 ${cashFlow.net_balance >= 0 ? 'text-violet-700' : 'text-orange-600'}`}>{formatCurrency(cashFlow.net_balance)}</h3>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-6 flex items-center gap-2 uppercase tracking-wider">
              Evolución Mensual
            </h3>
            <div className="h-72 w-full">
              {cashFlow.periods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cashFlow.periods} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dx={-10} />
                    <Tooltip
                      cursor={{ fill: '#f9f9f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="balance" name="Balance Neto" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">No hay suficientes datos para graficar</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Período</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ingresos</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Gastos</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {cashFlow.periods.map((p, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-violet-50/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-800">{p.period}</td>
                    <td className="p-4 text-sm font-semibold text-green-600 text-right">{formatCurrency(p.income)}</td>
                    <td className="p-4 text-sm font-semibold text-red-500 text-right">{formatCurrency(p.expenses)}</td>
                    <td className={`p-4 text-sm font-bold text-right ${p.balance >= 0 ? 'text-violet-600' : 'text-orange-500'}`}>{formatCurrency(p.balance)}</td>
                  </tr>
                ))}
                {cashFlow.periods.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="font-medium text-sm">No se encontraron registros para estos filtros.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profitability Content */}
      {!loading && !error && activeTab === "profitability" && profitability && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-6 flex items-center gap-2 uppercase tracking-wider">
              Comparativa de Margen por Proyecto
            </h3>
            <div className="h-72 w-full">
              {profitability.projects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitability.projects} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="project_name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dx={-10} />
                    <Tooltip
                      cursor={{ fill: '#f9f9f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="margin" name="Margen Neto" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">No hay suficientes datos para graficar</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profitability.projects.map((p, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-100 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg truncate pr-2 group-hover:text-violet-700 transition-colors" title={p.project_name}>{p.project_name}</h3>
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-1">
                      <Briefcase size={12} /> {p.client_name || "Sin cliente"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <DollarSign size={16} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Margen Neto</p>
                    <p className={`text-xl font-bold ${p.margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {formatCurrency(p.margin)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={10} /> Horas</p>
                      <p className="text-sm font-semibold text-gray-700">{p.invested_hours.toFixed(1)} hrs</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calculator size={10} /> Tarifa Efectiva</p>
                      <p className="text-sm font-semibold text-violet-600">{formatCurrency(p.effective_hourly_rate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {profitability.projects.length === 0 && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <Briefcase size={48} className="text-gray-300 mb-4" />
              <h3 className="text-base font-semibold text-gray-800 mb-1">Sin Proyectos</h3>
              <p className="text-sm text-gray-500">No hay información de proyectos para analizar con los filtros actuales.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
