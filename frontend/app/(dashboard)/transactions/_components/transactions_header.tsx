"use client";

import { Wallet, Plus } from "lucide-react";
import SectionHeader from "./../../_components/section_header";

export type SectionView = "income" | "expenses";

interface Props {
  activeView: SectionView;
  onViewChange: (view: SectionView) => void;
  onRegister: () => void;
}

export default function RevenueHeader({ activeView, onViewChange, onRegister }: Props) {
  return (
    <SectionHeader
      title="Ingresos y Gastos"
      subtitle="Registra y visualiza tus movimientos financieros"
      icon={<Wallet className="w-8 h-8 text-indigo-600" />}
    >
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => onViewChange("income")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeView === "income"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => onViewChange("expenses")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeView === "expenses"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Gastos
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={onRegister}
          className={`flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition ${
            activeView === "income"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <Plus className="w-4 h-4" />
          {activeView === "income" ? "Registrar Ingreso" : "Registrar Gasto"}
        </button>
      </div>
    </SectionHeader>
  );
}