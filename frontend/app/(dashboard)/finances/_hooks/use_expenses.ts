"use client";

import { useState, useCallback } from "react";

export interface Expense {
  id:             string;
  category_id:    string;
  category_name:  string | null;
  category_color: string | null;
  project_id:     string | null;
  project_name:   string | null;
  amount:         number;
  currency:       string;
  date:           string;
  description:    string | null;
}

interface Filters {
  category_id?: string;
  project_id?:  string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (filters: Filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res  = await fetch(`/api/expenses?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar gastos");
      setExpenses(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return { expenses, loading, error, load, total };
}