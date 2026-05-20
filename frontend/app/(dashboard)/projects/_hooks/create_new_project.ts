"use client";

import { useState, useEffect } from "react";

type ProjectFormData = {
  client_id: string;
  name: string;
  contract_type: "hourly" | "fixed_price" | "retainer"; 
  estimated_budget: number | null;
  deadline: Date | null;
};

const INITIAL_STATE: ProjectFormData = {
  client_id: "",
  name: "",
  contract_type: "fixed_price",
  estimated_budget: null,
  deadline: null,
};

export function useCreateProjectForm() {
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = getToken();
        const response = await fetch("/api/clients", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("No se pudieron cargar los clientes");
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  async function handleSubmit(e: React.FormEvent): Promise<boolean> {
    e.preventDefault();

    if (!formData.client_id || !formData.name || !formData.estimated_budget) {
      setError("Los campos con * son obligatorios");
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          client_id: formData.client_id,
          name: formData.name,
          contract_type: formData.contract_type,
          estimated_budget: formData.estimated_budget,
          deadline: formData.deadline ? formData.deadline.toISOString().split("T")[0] : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.error)
          ? data.error.map((e: any) => e.msg.replace("Value error, ", "")).join(", ")
          : data.error ?? "Error al crear el proyecto";
        throw new Error(String(errorMsg));
      }

      window.dispatchEvent(new CustomEvent("projectCreated"));
      setFormData(INITIAL_STATE);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fatal");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { formData, setFormData, handleSubmit, error, saved, loading, clients };
}