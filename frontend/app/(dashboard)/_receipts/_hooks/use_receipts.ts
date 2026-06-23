"use client";

// manages receipts state and API calls to /api/receipts.

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Receipt, ReceiptCreatePayload, ReceiptStatus } from "../types";

export type { Receipt, ReceiptCreatePayload, ReceiptStatus };

interface UseReceiptsReturn {
  receipts: Receipt[];
  loading:  boolean;
  error:    string | null;
  load:     (filters?: { project_id?: string; client_id?: string }) => Promise<void>;
  create:   (payload: ReceiptCreatePayload) => Promise<boolean>;
  markAs:   (id: string, status: ReceiptStatus) => Promise<boolean>;
  remove:   (id: string) => Promise<boolean>;
}

export function useReceipts(): UseReceiptsReturn {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  
  const load = useCallback(
    async (filters: { project_id?: string; client_id?: string } = {}) => {

      setLoading(true);
      setError(null);

      try {
        const url = new URL("/api/receipts", window.location.origin);
        if (filters.project_id) url.searchParams.set("project_id", filters.project_id);
        if (filters.client_id)  url.searchParams.set("client_id",  filters.client_id);

        const res  = await fetch(url.toString(), {
          cache: "no-store",
        });
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar recibos");

        setReceipts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const create = async (payload: ReceiptCreatePayload): Promise<boolean> => {
    try {
      const res  = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el recibo");

      setReceipts((prev) => [data, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
      return false;
    }
  };


  const markAs = async (id: string, status: ReceiptStatus): Promise<boolean> => {
    try {
      const res  = await fetch(`/api/receipts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");

      setReceipts((prev) => prev.map((r) => (r.id === id ? data : r)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      return false;
    }
  };


  const remove = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setReceipts((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      return false;
    }
  };

  return { receipts, loading, error, load, create, markAs, remove };
}