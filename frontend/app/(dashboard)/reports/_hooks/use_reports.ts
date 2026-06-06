import { useState, useEffect } from "react";

export interface CashFlowPeriod {
  period: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CashFlowReport {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  periods: CashFlowPeriod[];
}

export interface ProjectProfitability {
  project_id: string;
  project_name: string;
  client_name?: string;
  total_revenue: number;
  total_expenses: number;
  margin: number;
  invested_hours: number;
  effective_hourly_rate: number;
}

export interface ProfitabilityReport {
  projects: ProjectProfitability[];
}

export function useReports() {
  const [cashFlow, setCashFlow] = useState<CashFlowReport | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCashFlow = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) qs.append(k, v);
        });
      }
      const res = await fetch(`/api/reports/cash-flow?${qs.toString()}`);
      if (!res.ok) throw new Error("Error fetching cash flow");
      const data = await res.json();
      setCashFlow(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitability = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) qs.append(k, v);
        });
      }
      const res = await fetch(`/api/reports/profitability?${qs.toString()}`);
      if (!res.ok) throw new Error("Error fetching profitability");
      const data = await res.json();
      setProfitability(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    cashFlow,
    profitability,
    loading,
    error,
    fetchCashFlow,
    fetchProfitability
  };
}
