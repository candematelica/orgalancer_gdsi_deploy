"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import NewClientModal from "@/app/(dashboard)/_components/new_client_modal";

type Client = {
  id: string;
  name: string;
  email: string;
  client_type: string;
  phone_number: string;
  address: string;
  website: string;
  extra_info: string;
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/clients/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (res.ok) setClient(data);

    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">Cargando cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">Cliente no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-violet-600 transition-colors"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-violet-700">{client.name}</h1>
          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
          >
            Editar
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{client.client_type}</p>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-2 gap-5">

        {/* Contacto */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-600">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-violet-600">Contacto</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-800">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
              <p className="text-sm text-gray-800">{client.phone_number || "—"}</p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-pink-500">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-pink-500">Ubicación</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Dirección</p>
              <p className="text-sm text-gray-800">{client.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Sitio web</p>
              <p className="text-sm text-gray-800">{client.website || "—"}</p>
            </div>
          </div>
        </div>

        {/* Proyectos activos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-blue-500">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-blue-500">Proyectos activos</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800">0</p>
          <p className="text-xs text-gray-400 mt-1">Sin proyectos por ahora</p>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-green-500">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-green-500">Ingresos totales</h2>
          </div>
          <p className="text-3xl font-bold text-green-600">$0</p>
          <p className="text-xs text-gray-400 mt-1">Se calculará con los proyectos</p>
        </div>

        {/* Notas internas — ocupa todo el ancho si hay notas */}
        {client.extra_info && (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-yellow-500">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-yellow-600">Notas internas</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{client.extra_info}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editModalOpen && client && (
        <NewClientModal
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchClient();
          }}
          clientToEdit={client}
        />
      )}
    </div>
  );
}