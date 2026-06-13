"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import NewClientModal from "@/app/(dashboard)/_components/new_client_modal";
import ClientHeader from "./_components/client_header";
import ClientTabs, { type TabId } from "./_components/client_tabs";
import GeneralTab from "./_components/general_tab";
import ProjectsTab from "./_components/projects_tab";
import ReceiptsTab from "./_components/receipts_tab";
import TasksTab from "./_components/tasks_tab";
import DeleteModal from "./_components/delete_modal";
import { useClient } from "./_hooks/use_client";
import { useDeleteClient } from "./_hooks/use_delete_client";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const { client, loading, refetch } = useClient(clientId);
  const { deleteModal, deleting, handleDeleteClick, handleDeleteConfirm, closeModal } = useDeleteClient(clientId);

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [editModalOpen, setEditModalOpen] = useState(false);

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
      <ClientHeader
        name={client.name}
        clientType={client.client_type}
        onEdit={() => setEditModalOpen(true)}
        onDelete={handleDeleteClick}
      />

      <ClientTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "general"  && <GeneralTab client={client} clientId={clientId} />}
      {activeTab === "projects" && <ProjectsTab clientId={clientId} />}
      {activeTab === "receipts" && <ReceiptsTab clientId={clientId} />}
      {activeTab === "tasks"    && <TasksTab clientId={clientId} />}

      {editModalOpen && (
        <NewClientModal
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => { setEditModalOpen(false); refetch(); }}
          clientToEdit={client}
        />
      )}

      <DeleteModal
        state={deleteModal}
        clientName={client.name}
        deleting={deleting}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}