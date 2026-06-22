"use client";

import { useEffect, useState } from "react";
import { getUser } from "../../../_hooks/get_user";
import { API_BASE } from "../_lib/api";

type FinancialConfig = {
  coin_type: string;
  hourly_rate: string;
  expectedEarnings: string;
  desiredSalary: string;
  availableHours: string;
  profit_margin: string;
  hoursMode: "weekly" | "monthly";
};

export function useFinancialForm() {
  const user = getUser();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState<FinancialConfig>({
    coin_type: "USD",
    hourly_rate: "",
    expectedEarnings: "",
    desiredSalary: "",
    availableHours: "",
    profit_margin: "",
    hoursMode: "weekly",
  });

  useEffect(() => {
    if (!user) return;

    fetch(`/api/finances`)
      .then(res => res.json())
      .then(data => {
        setFormData(prev => ({ ...prev, ...data }));
      })
      .catch(console.error);

    const handleFinancialSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;

      setFormData(prev => ({
        ...prev,
        ...customEvent.detail,
      }));
    };

    window.addEventListener(
      "financialSettingsUpdated",
      handleFinancialSettingsUpdated
    );

    return () => {
      window.removeEventListener(
        "financialSettingsUpdated",
        handleFinancialSettingsUpdated
      );
    };
  }, [user]);

  function handleChange(field: string, value: string) {

    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const calculateSuggestedRate = () => {

    const currentRate = Number(formData.hourly_rate);
    const salary = Number(formData.desiredSalary);
    const hours  = Number(formData.availableHours);
    const margin = Number(formData.profit_margin);

    if (salary <= 0 || hours <= 0) return null;

    const monthlyHours = formData.hoursMode === "weekly" ? hours * 4.33 : hours;

    const baseRate = salary / monthlyHours;

    const suggestedRate = baseRate * (1 + margin / 100);

    const rateDiff = currentRate - suggestedRate;

    type RateStatus = "low" | "ok" | "high";

    let rateStatus: RateStatus =
      rateDiff <= -10
        ? "low"
        : rateDiff >= 10
        ? "high"
    : "ok";

    if (currentRate === 0 || isNaN(currentRate)) {
      rateStatus = "ok";
    }

    return {
      baseRate:        baseRate.toFixed(2),
      suggestedRate:   suggestedRate.toFixed(2),
      monthlyBilling:  (suggestedRate * monthlyHours).toFixed(2),  // lo que facturás
      monthlyProfit:   (baseRate * margin / 100 * monthlyHours).toFixed(2), // ganancia real
      rateStatus,
    };
  };

  const suggested = calculateSuggestedRate();


  return {
    saved,
    setSaved,
    editing,
    setEditing,
    formData,
    setFormData,
    handleChange,
    suggested,
  };
}