"use client";

import { useRouter } from "next/navigation";

interface Props {
  name: string;
  clientType: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClientHeader({ name, clientType, onEdit, onDelete }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-violet-600 transition-colors"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-violet-700 truncate">{name}</h1>
        <p className="text-sm text-gray-400 shrink-0">{clientType}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}