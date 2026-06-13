"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type DeleteModalState = "none" | "confirm" | "warning";

export function useDeleteClient(clientId: string) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>("none");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = async () => {
    try {
      const res = await fetch(`/api/projects?client_id=${clientId}&state=active`);
      const data = await res.json();
      setDeleteModal(Array.isArray(data) && data.length > 0 ? "warning" : "confirm");
    } catch {
      setDeleteModal("confirm");
    }
  };

  const handleDeleteConfirm = async (action: "cancel" | "complete") => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}?action=${action}`, { method: "DELETE" });
      if (res.ok) router.push("/clients");
    } catch (err) {
      console.error("Error eliminando cliente", err);
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => setDeleteModal("none");

  return {
    deleteModal,
    deleting,
    handleDeleteClick,
    handleDeleteConfirm,
    closeModal,
  };
}