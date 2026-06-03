"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrency } from "./../../../_hooks/get_currency";

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string | null;
}

export interface Expense {
  id: string;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  project_id: string | null;
  project_name: string | null;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
}

export interface ExpenseFilters {
  category_id?: string;
  project_id?: string;
  from?: string;
  to?: string;
}

function toExpense(raw: any): Expense {
  return {
    id:             raw.id,
    category_id:    raw.category_id,
    category_name:  raw.category_name  ?? null,
    category_color: raw.category_color ?? null,
    project_id:     raw.project_id     ?? null,
    project_name:   raw.project_name   ?? null,
    amount:         parseFloat(raw.amount),
    currency:       raw.currency,
    date:           raw.date,
    description:    raw.description    ?? null,
  };
}

export function useExpenses() {
  const currency = getCurrency();
  const [expenses,   setExpenses]   = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res  = await fetch("/api/expenses/categories", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar categorías");
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  async function createCategory(name: string, color: string | null): Promise<ExpenseCategory | null> {
    try {
      const res  = await fetch("/api/expenses/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, color }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear categoría");
      setCategories((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear categoría");
      return null;
    }
  }

  async function updateCategory(id: string, name: string, color: string | null): Promise<ExpenseCategory | null> {
    try {
      const res  = await fetch(`/api/expenses/categories/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, color }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar categoría");
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar categoría");
      return null;
    }
  }

  async function removeCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/expenses/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar categoría");
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setExpenses((prev) =>
        prev.map((e) =>
          e.category_id === id
            ? { ...e, category_id: "", category_name: "Sin categoría", category_color: null }
            : e
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar categoría");
      return false;
    }
  }

  const load = useCallback(async (filters: ExpenseFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/expenses", window.location.origin);
      if (filters.category_id) url.searchParams.set("category_id", filters.category_id);
      if (filters.project_id)  url.searchParams.set("project_id",  filters.project_id);
      if (filters.from)        url.searchParams.set("from",         filters.from);
      if (filters.to)          url.searchParams.set("to",           filters.to);

      const res  = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar gastos");
      setExpenses(data.map(toExpense));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  async function save(expense: Omit<Expense, "id" | "category_name" | "category_color" | "project_name">): Promise<boolean> {
    try {
      const res  = await fetch("/api/expenses", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(expense),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExpenses((prev) => [toExpense(data), ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      return false;
    }
  }

  async function update(id: string, expense: Omit<Expense, "id" | "category_name" | "category_color" | "project_name">): Promise<boolean> {
    try {
      const res  = await fetch(`/api/expenses/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(expense),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExpenses((prev) => prev.map((e) => (e.id === id ? toExpense(data) : e)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      return false;
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      return false;
    }
  }

  useEffect(() => { load(); loadCategories(); }, [load, loadCategories]);

  return {
    expenses, categories, loading, error, currency,
    load, save, update, remove,
    createCategory, updateCategory, removeCategory,
  };
}