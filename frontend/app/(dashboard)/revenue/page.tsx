"use client";

import { useState, useEffect } from "react";
import RevenueHeader from "./_components/revenue_header";
import RevenueTabs, { type RevenueTab } from "./_components/revenue_tabs";
import RevenueStatCards from "./_components/revenue_stat_cards";
import TransactionList, { type Transaction } from "./_components/transaction_list";
import RegisterIncomeModal from "./_components/register_income_modal";
import { useRevenue } from "./_hooks/use_revenue";

import ReceiptDetailModal from "./../_receipts/_components/receipt_detail_modal"
import { type Receipt } from "./../_receipts/types";

interface SelectOption { id: string; name: string; }

function useOptions(apiPath: string): SelectOption[] {
  const [options, setOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(apiPath, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setOptions(data.map((d) => ({ id: d.id, name: d.name }))))
      .catch(() => {});
  }, [apiPath]);
  return options;
}

export default function RevenuePage() {
  const [activeTab, setActiveTab] = useState<RevenueTab>("general");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const clients  = useOptions("/api/clients");
  const projects = useOptions("/api/projects");

  const { transactions, loading, error, load, save, update, remove, currency } = useRevenue();

  const monetary = transactions.filter((t) => t.payment_type === "monetario").reduce((s, t) => s + t.amount, 0);
  const barter   = transactions.filter((t) => t.payment_type === "canje").reduce((s, t) => s + t.amount, 0);
  const total    = monetary + barter;

  const handleViewReceipt = async (receiptId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSelectedReceipt(data);
    } catch (err) {
      console.error("Error al cargar el recibo", err);
    }
  };

  async function handleSave(tx: Omit<Transaction, "id">) {
    if (editingTx) {
      await update(editingTx.id, tx);
      setEditingTx(null);
    } else {
      await save(tx);
    }
    setModalOpen(false);
  }

  function handleEdit(tx: Transaction) {
    setEditingTx(tx);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este ingreso?")) await remove(id);
  }

  function handleTabChange(tab: RevenueTab) {
    setActiveTab(tab);
    if (tab === "general") load();
  }

  function applyClientFilter() {
    load({ client_id: clientId || undefined });
  }

  function applyProjectFilter() {
    load({ project_id: projectId || undefined });
  }

  function applyPeriodFilter() {
    load({ from: fromDate || undefined, to: toDate || undefined });
  }

  return (
    <div>
      <RevenueHeader onRegister={() => setModalOpen(true)} />

      <RevenueTabs active={activeTab} onChange={handleTabChange} />

      {/* ── Filters for non-general tabs ── */}
      {activeTab === "client" && (
        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">Todos los clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={applyClientFilter}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Filtrar
          </button>
          <button
            onClick={() => { setClientId(""); load(); }}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        </div>
      )}

      {activeTab === "project" && (
        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-gray-500 mb-1">Proyecto</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <option value="">Todos los proyectos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={applyProjectFilter}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Filtrar
          </button>
          <button
            onClick={() => { setProjectId(""); load(); }}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        </div>
      )}

      {activeTab === "period" && (
        <div className="flex items-end gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <button
            onClick={applyPeriodFilter}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Filtrar
          </button>
          <button
            onClick={() => { setFromDate(""); setToDate(""); load(); }}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {loading && <p className="text-sm text-gray-400 mt-4">Cargando...</p>}
      {error   && <p className="text-sm text-red-500 mt-4">{error}</p>}

      {!loading && !error && activeTab === "general" && (
        <RevenueStatCards total={total} monetary={monetary} barter={barter} currency={currency} />
      )}

      {!loading && !error && (
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewReceipt={handleViewReceipt}
        />
      )}

      {selectedReceipt && (
        <ReceiptDetailModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}

      <RegisterIncomeModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSave={handleSave}
        currency={currency}
        initialData={editingTx ?? undefined}
        mode={editingTx ? "edit" : "create"}
      />
    </div>
  );
}
