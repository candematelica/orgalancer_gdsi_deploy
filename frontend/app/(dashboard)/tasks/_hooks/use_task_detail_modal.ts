"use client";

import { useState, useEffect } from "react";

interface UseTaskDetailModalProps {
  onClose:  () => void;
  onDelete: (taskId: string) => void;
  taskId:   string;
}

export function useTaskDetailModal({ onClose, onDelete, taskId }: UseTaskDetailModalProps) {
  const [isDeleting,        setIsDeleting]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    await onDelete(taskId);
    setIsDeleting(false);
  };

  return {
    isDeleting,
    showDeleteConfirm,
    openDeleteConfirm:  () => setShowDeleteConfirm(true),
    closeDeleteConfirm: () => setShowDeleteConfirm(false),
    handleDelete,
  };
}