"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NewClientModal from "@/app/(dashboard)/_components/new_client_modal";
import SectionHeader from "./../_components/section_header"
import { Users } from "lucide-react"

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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      client.email.toLowerCase().includes(q) ||
      client.client_type.toLowerCase().includes(q)
    );
  });

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  const hasClients = clients.length > 0;
  const noResults = hasClients && filteredClients.length === 0 && searchQuery.trim() !== "";

  return (
    <div className="h-full flex flex-col">
      <SectionHeader
        title="Clientes"
        subtitle="Gestiona tus relaciones comerciales"
        icon={<Users className="w-8 h-8 text-indigo-600" />}
      >
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo cliente
        </button>
      </SectionHeader>

      {hasClients && (
        <div className="mb-5">
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, email o etiqueta..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition shadow-sm"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

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
      ) : noResults ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-md shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.5 8.5l5 5M13.5 8.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Sin resultados</h2>
            <p className="text-sm text-gray-400 mb-6">
              No se encontraron clientes que coincidan con{" "}
              <span className="font-medium text-gray-600">&quot;{searchQuery}&quot;</span>.
            </p>
            <button
              onClick={handleClearSearch}
              className="px-6 py-2.5 rounded-xl border border-violet-300 text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      ) : (
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
              {filteredClients.map((client, i) => (
                <tr
                  key={client.id}
                  className={`hover:bg-violet-50/30 transition-colors ${i < filteredClients.length - 1 ? "border-b border-gray-50" : ""}`}
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
