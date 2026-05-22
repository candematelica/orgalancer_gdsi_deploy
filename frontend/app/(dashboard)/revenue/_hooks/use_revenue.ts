"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Transaction } from "../_components/transaction_list";

export interface RevenueFilters {
  client_id?: string;
  project_id?: string;
  from?: string;
  to?: string;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$",
  MXN: "$", BRL: "R$", CLP: "$", COP: "$", JPY: "¥",
};

function toTransaction(raw: any): Transaction {
  return {
    id: raw.id,
    project_name: raw.project_name ?? raw.project_id ?? "Sin proyecto",
    client_name: raw.client_name ?? raw.client_id ?? "Sin cliente",
    amount: parseFloat(raw.amount),
    currency: raw.currency,
    payment_type: raw.payment_type,
    payment_method: raw.payment_method ?? raw.payment_type,
    date: raw.date,
    description: raw.description ?? undefined,
  };
}

export function useRevenue() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("$");

  const getToken = () => localStorage.getItem("token");

  // Fetch currency from user's financial config
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw) as { id: string };
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/finances/${user.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.coin_type) {
          setCurrency(CURRENCY_SYMBOL[data.coin_type] ?? data.coin_type);
        }
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async (filters: RevenueFilters = {}) => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/revenue", window.location.origin);
      if (filters.client_id)  url.searchParams.set("client_id",  filters.client_id);
      if (filters.project_id) url.searchParams.set("project_id", filters.project_id);
      if (filters.from)       url.searchParams.set("from",        filters.from);
      if (filters.to)         url.searchParams.set("to",          filters.to);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar ingresos");
      setTransactions(data.map(toTransaction));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [router]);

  async function save(tx: Omit<Transaction, "id">): Promise<boolean> {
    const token = getToken();
    if (!token) return false;

    try {
      const res = await fetch("/api/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: tx.amount,
          currency: tx.currency,
          date: tx.date,
          payment_type: tx.payment_type,
          payment_method: tx.payment_method,
          description: tx.description ?? null,
          project_id: tx.project_id ?? null,
          client_id: tx.client_id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Agrega la nueva transacción al inicio con los datos enriquecidos del backend
      setTransactions((prev) => [toTransaction(data), ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    }
  }

  useEffect(() => { load(); }, [load]);

  return { transactions, loading, error, load, save, currency };
}
