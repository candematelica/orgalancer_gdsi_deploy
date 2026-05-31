"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

interface Props {
  year:      number;
  month:     number;
  color:     string;
  onPrev:    () => void;
  onNext:    () => void;
  onCurrent: () => void;
}

export default function StatsMonthSelector({ year, month, color, onPrev, onNext, onCurrent }: Props) {
  const now       = new Date();
  const isCurrent = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center gap-3">
      <p className="text-sm text-gray-400">Período</p>
      <div className="flex items-center gap-4">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
          <ChevronLeft size={18} />
        </button>
        <p className={`text-3xl font-bold ${color} text-center w-52`}>
          {MONTH_NAMES[month]}<br />
          <span className="text-lg font-semibold text-gray-400">{year}</span>
        </p>
        <button
          onClick={onNext}
          disabled={isCurrent}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {!isCurrent ? (
        <button onClick={onCurrent} className="text-xs text-green-600 hover:underline">
          Volver al mes actual
        </button>
      ) : (
        <p className="text-xs text-gray-300">Mes actual</p>
      )}
    </div>
  );
}