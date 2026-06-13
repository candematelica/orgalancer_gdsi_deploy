"use client";

import { useState, useEffect } from "react";

export interface ClientReceipt {
  id: string;
  concept: string;
  amount: number;
  date_emitted: string;
  status: string;
  project_name: string | null;
}

export function useClientReceipts(clientId: string) {
  const [receipts, setReceipts] = useState<ClientReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/receipts?client_id=${clientId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setReceipts)
      .catch(() => setReceipts([]))
      .finally(() => setLoading(false));
  }, [clientId]);

  return { receipts, loading };
}