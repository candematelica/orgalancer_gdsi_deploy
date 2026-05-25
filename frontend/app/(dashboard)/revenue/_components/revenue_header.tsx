"use client";

import { DollarSign, Plus } from "lucide-react";

interface Props {
  onRegister?: () => void;
}

export default function RevenueHeader({ onRegister }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <DollarSign className="w-7 h-7 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ingresos</h1>
          <p className="text-sm text-gray-400">Registra y visualiza tus pagos monetarios y canjes</p>
        </div>
      </div>

      <button
        onClick={onRegister}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
      >
        <Plus className="w-4 h-4" />
        Registrar Ingreso
      </button>
    </div>
  );
}
