"use client";

import { useState, useEffect } from "react";

type ContractType = "hourly" | "fixed_price" | "retainer";

export type UpdateProjectFormData = {
  name: string;
  contract_type: ContractType;
  estimated_budget: number;
  deadline: string;
};

export function useUpdateProject(
  project: { id: string; name: string; contract_type: string; estimated_budget: number; deadline: string | null } | null,
  onSaved: () => void,
  onClose: () => void,
) {
  const [formData, setFormData] = useState<UpdateProjectFormData>({
    name: "",
    contract_type: "fixed_price",
    estimated_budget: 0,
    deadline: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        contract_type: project.contract_type as ContractType,
        estimated_budget: project.estimated_budget,
        deadline: project.deadline ?? "",
      });
      setError(null);
      setSaved(false);
    }
  }, [project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/projects`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: project!.id,
          name: formData.name,
          contract_type: formData.contract_type,
          estimated_budget: formData.estimated_budget,
          deadline: formData.deadline || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Array.isArray(data.error)
          ? data.error.map((e: any) => e.msg.replace("Value error, ", "")).join(", ")
          : data.error ?? "Error al guardar";
        throw new Error(String(errorMsg));
      }

      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return { formData, setFormData, handleSubmit, saving, error, saved };
}