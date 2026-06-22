"use client";

import { useRouter } from "next/navigation";
import { useClientStats } from "../_hooks/use_client_stats";

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

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void | Promise<void>;
}

export default function ClientsTable({ clients, onEdit, onDelete }: Props) {
  const router = useRouter();
  const clientIds = clients.map((c) => c.id);
  const { stats, loading: statsLoading } = useClientStats(clientIds);

  return (
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
          {clients.map((client, i) => {
            const clientStats = stats[client.id];
            return (
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
                  {statsLoading || !clientStats ? (
                    <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                  ) : (
                    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                      clientStats.activeProjects > 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {clientStats.activeProjects} {clientStats.activeProjects === 1 ? "proyecto" : "proyectos"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {statsLoading || !clientStats ? (
                    <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-800">
                      ${clientStats.totalRevenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  )}
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
                      onClick={() => onEdit(client)}
                      className="text-sm font-semibold text-violet-700 hover:text-blue-800 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="text-sm font-semibold text-red-400 hover:text-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}