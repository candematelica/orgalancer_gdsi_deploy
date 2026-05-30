"use client";

import { useState, useEffect } from "react";
import RevenueHeader, { type SectionView }   from "./_components/transactions_header";
import SectionTabs, { type Tab }             from "./_components/section_tabs";
import RevenueStatCards                      from "./_components/income_stats";
import TransactionList, { type Transaction } from "./_components/income_list";
import RegisterIncomeModal                   from "./_components/register_income_modal";
import { useRevenue }                        from "./_hooks/use_revenue";
import { useExpenses, type Expense }         from "./_hooks/use_expenses";
import ReceiptDetailModal                    from "./../_receipts/_components/receipt_detail_modal";
import { type Receipt }                      from "./../_receipts/types";
import ExpenseStatCards                      from "./_components/expense_stats";
import ExpenseList                           from "./_components/expense_list";
import RegisterExpenseModal                  from "./_components/register_expense_modal";

// shared style tokens
const FILTER_SELECT = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300";
const DATE_INPUT    = "px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300";
const BTN_PRIMARY   = "px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition";
const BTN_GHOST     = "px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition";

type RevenueTab = "general" | "client" | "project" | "period";
const INCOME_TABS: Tab<RevenueTab>[] = [
  { id: "general", label: "Vista General" },
  { id: "client",  label: "Por Cliente"   },
  { id: "project", label: "Por Proyecto"  },
  { id: "period",  label: "Por Período"   },
];

interface SelectOption { id: string; name: string; }

function useOptions(apiPath: string): SelectOption[] {
  const [options, setOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    fetch(apiPath, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => setOptions(data.map((d) => ({ id: d.id, name: d.name }))))
      .catch(() => {});
  }, [apiPath]);
  return options;
}

export default function RevenuePage() {
  // section toggle
  const [activeView, setActiveView] = useState<SectionView>("income");

  // income state
  const [activeTab, setActiveTab]   = useState<RevenueTab>("general");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingTx, setEditingTx]   = useState<Transaction | null>(null);
  const [clientId, setClientId]     = useState("");
  const [projectId, setProjectId]   = useState("");
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const clients  = useOptions("/api/clients");
  const projects = useOptions("/api/projects");
  const { transactions, loading, error, load, save, update, remove, currency } = useRevenue();

  //expenses state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense,   setEditingExpense]   = useState<Expense | null>(null);
  const {
    expenses, categories, loading: expLoading, error: expError,
    load: loadExpenses, save: saveExpense, update: updateExpense,
    remove: removeExpense, createCategory, updateCategory, removeCategory
  } = useExpenses();

  const monetary = transactions.filter((t) => t.payment_type === "monetario").reduce((s, t) => s + t.amount, 0);
  const barter   = transactions.filter((t) => t.payment_type === "canje").reduce((s, t) => s + t.amount, 0);
  const total    = monetary + barter;

  // handlers
  const handleViewReceipt = async (receiptId: string) => {
    try {
      const res  = await fetch(`/api/receipts/${receiptId}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setSelectedReceipt(data);
    } catch (err) { console.error("Error al cargar el recibo", err); }
  };

  async function handleSave(tx: Omit<Transaction, "id">) {
    if (editingTx) { await update(editingTx.id, tx); setEditingTx(null); }
    else            { await save(tx); }
    setModalOpen(false);
  }

  function handleEdit(tx: Transaction)   { setEditingTx(tx); setModalOpen(true); }
  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este ingreso?")) await remove(id);
  }

  function handleTabChange(tab: RevenueTab) {
    setActiveTab(tab);
    if (tab === "general") load();
  }

  function handleRegister() {
    if (activeView === "income")   setModalOpen(true);
    if (activeView === "expenses") { setEditingExpense(null); setExpenseModalOpen(true); }
  }

  return (
    <div>
      <RevenueHeader
        activeView={activeView}
        onViewChange={setActiveView}
        onRegister={handleRegister}
      />

      {/* income view */}
      {activeView === "income" && (
        <>
          {activeTab === "client" && (
            <div className="flex items-end gap-3 mb-5">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={FILTER_SELECT}
                >
                  <option value="">Todos los clientes</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={() => load({ client_id: clientId || undefined })} className={BTN_PRIMARY}>Filtrar</button>
              <button onClick={() => { setClientId(""); load(); }}               className={BTN_GHOST}>Limpiar</button>
            </div>
          )}

          {activeTab === "project" && (
            <div className="flex items-end gap-3 mb-5">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-500 mb-1">Proyecto</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={FILTER_SELECT}
                >
                  <option value="">Todos los proyectos</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button onClick={() => load({ project_id: projectId || undefined })} className={BTN_PRIMARY}>Filtrar</button>
              <button onClick={() => { setProjectId(""); load(); }}                 className={BTN_GHOST}>Limpiar</button>
            </div>
          )}

          {activeTab === "period" && (
            <div className="flex items-end gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={DATE_INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                <input type="date" value={toDate}   onChange={(e) => setToDate(e.target.value)}   className={DATE_INPUT} />
              </div>
              <button onClick={() => load({ from: fromDate || undefined, to: toDate || undefined })} className={BTN_PRIMARY}>Filtrar</button>
              <button onClick={() => { setFromDate(""); setToDate(""); load(); }}                     className={BTN_GHOST}>Limpiar</button>
            </div>
          )}

          {loading && <p className="text-sm text-gray-400 mt-4">Cargando...</p>}
          {error   && <p className="text-sm text-red-500  mt-4">{error}</p>}

          {!loading && !error && activeTab === "general" && (
            <RevenueStatCards transactions={transactions} currency={currency} />
          )}

          <SectionTabs
            tabs={INCOME_TABS}
            active={activeTab}
            onChange={handleTabChange}
            activeColor="bg-green-600"
          />

          {!loading && !error && (
            <TransactionList
              transactions={transactions}
              currency={currency}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {selectedReceipt && (
            <ReceiptDetailModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
          )}

          <RegisterIncomeModal
            open={modalOpen}
            onClose={() => { setModalOpen(false); setEditingTx(null); }}
            onSave={handleSave}
            currency={currency}
            initialData={editingTx ?? undefined}
            mode={editingTx ? "edit" : "create"}
          />
        </>
      )}

      {/* expenses view */}
      {activeView === "expenses" && (
        <>
          {expLoading && <p className="text-sm text-gray-400 mt-4">Cargando...</p>}
          {expError   && <p className="text-sm text-red-500  mt-4">{expError}</p>}

          {!expLoading && !expError && (
            <ExpenseStatCards expenses={expenses} categories={categories} currency={currency} />
          )}

          {!expLoading && !expError && (
            <ExpenseList
              expenses={expenses}
              categories={categories}
              currency={currency}
              onEdit={(exp) => { setEditingExpense(exp); setExpenseModalOpen(true); }}
            />
          )}

          <RegisterExpenseModal
            open={expenseModalOpen}
            onClose={() => { setExpenseModalOpen(false); setEditingExpense(null); }}
            onSave={async (data) => {
              if (editingExpense) return updateExpense(editingExpense.id, data);
              return saveExpense(data);
            }}
            onCreateCategory={createCategory}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
            categories={categories}
            currency={currency}
            initialData={editingExpense ?? undefined}
            mode={editingExpense ? "edit" : "create"}
          />
        </>
      )}
    </div>
  );
}
