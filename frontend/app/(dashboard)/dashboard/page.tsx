"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import PendingTasks from "./_components/pending_tasks";
import PaymentReminders from "./_components/payment_reminders";
import SectionHeader from "./../_components/section_header";
import MonthlyRevenueChart from "./_components/MonthlyRevenueChart";
import PeriodSelector, { type DateRange } from "./_components/PeriodSelector";
import DashboardMetrics from "./_components/DashboardMetrics";

function getDefaultRange(): DateRange {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`;
  return { from, to };
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>(getDefaultRange());

  return (
    <>
      <SectionHeader title="Dashboard" subtitle="Resumen de tu negocio freelance" icon={<Sparkles className="w-8 h-8 text-indigo-600" />}>
        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium shadow-sm">
          Generar Presupuesto
        </button>
      </SectionHeader>

      <PeriodSelector onChange={setRange} />

      <DashboardMetrics from={range.from} to={range.to} />

      <div className="mb-6">
        <MonthlyRevenueChart />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <PendingTasks />
        <PaymentReminders />
      </div>
    </>
  );
}