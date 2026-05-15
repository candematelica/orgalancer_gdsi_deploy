"use client";

import { useState } from "react";
import NewClientModal from "@/app/(dashboard)/_components/new_client_modal";

export default function ClientsPage() {
  const [modalAbierto, setOpenModal] = useState(false);
  const [created, setCreated] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-violet-700">Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus relaciones comerciales</p>
        </div>
        <button
          onClick={() => { setOpenModal(true); setCreated(false); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo cliente
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center">
        {created ? (
          // Cartel de éxito tras crear
          <div className="bg-white border border-violet-100 rounded-2xl p-10 text-center max-w-sm shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">¡Cliente creado!</h2>
            <p className="text-sm text-gray-400 mb-6">
              El cliente fue guardado correctamente.
            </p>
            <button
              onClick={() => { setOpenModal(true); setCreated(false); }}
              className="text-sm text-violet-600 font-medium hover:underline"
            >
              + Agregar otro cliente
            </button>
          </div>
        ) : (
          // Estado vacío
          <div className="bg-white border-2 border-dashed border-violet-200 rounded-3xl p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-violet-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Todavía no tenés clientes</h2>
            <p className="text-sm text-gray-400 mb-6">
              Creá tu primer cliente para empezar a gestionar tus proyectos.
            </p>
            <button
              onClick={() => setOpenModal(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              + Nuevo cliente
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <NewClientModal
          onClose={() => setOpenModal(false)}
          onSuccess={() => setCreated(true)}
        />
      )}
    </div>
  );
}