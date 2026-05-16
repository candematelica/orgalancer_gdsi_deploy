"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function ClientsPage() {
  const router = useRouter();
  const [modalAbierto, setOpenModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/clients", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (res.ok) setClients(data);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-violet-700">Clientes</h1>
          <p className="text-sm text-gray-400 mt-1">Gestiona tus relaciones comerciales</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo cliente
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">Cargando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
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
        </div>
      ) : (
        // Tabla
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-blue-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contacto</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Proyectos activos</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Ingresos totales</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr
                  key={client.id}
                  className={`hover:bg-violet-50/30 transition-colors ${i < clients.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{client.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{client.client_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-gray-400 shrink-0">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      {client.email}
                    </div>
                    {client.phone_number && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="shrink-0">
                          <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.61 21 3 14.39 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {client.phone_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                      0 proyectos
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">$0</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => router.push(`/clients/${client.id}`)}
                        className="text-sm font-semibold text-blue-500 hover:text-violet-800 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          setClientToEdit(client);
                          setOpenModal(true);
                        }}
                        className="text-sm font-semibold text-violet-700 hover:text-blue-800 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <NewClientModal
          onClose={() => {
            setOpenModal(false);
            setClientToEdit(null);
          }}
          onSuccess={() => {
            setOpenModal(false);
            setClientToEdit(null);
            fetchClients();
          }}
          clientToEdit={clientToEdit}
        />
      )}
    </div>
  );
}