"use client";

import { useState } from "react";
import RevenueHeader from "./_components/revenue_header";
import RevenueTabs, { type RevenueTab } from "./_components/revenue_tabs";
import RevenueStatCards from "./_components/revenue_stat_cards";
import TransactionList, { type Transaction } from "./_components/transaction_list";
import RegisterIncomeModal from "./_components/register_income_modal";

// Datos de ejemplo — reemplazar por fetch al backend
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    project_name: "Diseño de Identidad Corporativa",
    client_name: "TechStartup SL",
    amount: 2275,
    currency: "€",
    payment_type: "monetario",
    payment_method: "Transferencia",
    date: "2026-05-14",
  },
  {
    id: "2",
    project_name: "Desarrollo Web Responsive",
    client_name: "Marketing Pro",
    amount: 2080,
    currency: "€",
    payment_type: "monetario",
    payment_method: "Efectivo",
    date: "2026-05-09",
  },
  {
    id: "3",
    project_name: "Campaña Redes Sociales Q2",
    client_name: "Diseño Creativo",
    amount: 800,
    currency: "€",
    payment_type: "canje",
    payment_method: "Canje",
    date: "2026-05-07",
    description: "Servicios de fotografía profesional para portfolio",
  },
];

export default function RevenuePage() {
  const [activeTab, setActiveTab] = useState<RevenueTab>("general");
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  function handleSave(tx: Omit<Transaction, "id">) {
    setTransactions((prev) => [{ ...tx, id: Date.now().toString() }, ...prev]);
  }
  const monetary = transactions
    .filter((t) => t.payment_type === "monetario")
    .reduce((s, t) => s + t.amount, 0);
  const barter = transactions
    .filter((t) => t.payment_type === "canje")
    .reduce((s, t) => s + t.amount, 0);
  const total = monetary + barter;

  return (
    <div>
      <RevenueHeader onRegister={() => setModalOpen(true)} />

      <RevenueTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "general" && (
        <>
          <RevenueStatCards
            total={total}
            monetary={monetary}
            barter={barter}
            currency="€"
          />
          <TransactionList transactions={transactions} />
        </>
      )}

      {activeTab === "client"  && <p className="text-sm text-gray-400 mt-4">Vista por cliente — próximamente.</p>}
      {activeTab === "project" && <p className="text-sm text-gray-400 mt-4">Vista por proyecto — próximamente.</p>}
      {activeTab === "period"  && <p className="text-sm text-gray-400 mt-4">Vista por período — próximamente.</p>}

      <RegisterIncomeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        currency="€"
      />
    </div>
  );
}
