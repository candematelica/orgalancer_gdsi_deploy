"use client";

import { useState, useEffect, useCallback } from "react";

export interface PendingReceipt {
  id: string;
  concept: string;
  amount: number;
  date_emitted: string;
  status: string;
  client_id: string | null;
  project_name: string | null;
}

export function usePendingReceipts(clientId: string) {
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchPendingReceipts = useCallback(async () => {
    try {
      const res = await fetch(`/api/receipts?client_id=${clientId}`);
      if (res.ok) {
        const data: PendingReceipt[] = await res.json();
        const pending = data.filter((r) => r.status === "pending");
        setPendingReceipts(pending);
        if (pending.length > 0) setSelectedReceiptId(pending[0].id);
      }
    } catch { } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchPendingReceipts();
  }, [fetchPendingReceipts]);

  return { pendingReceipts, selectedReceiptId, setSelectedReceiptId, loading };
}