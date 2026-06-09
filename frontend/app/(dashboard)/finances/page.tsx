"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import SectionHeader from "./../_components/section_header"
import FinancesShell from "./_components/finances_shell";
import FinancialForm from "./_components/financial_form";
import TariffCalculator from "./_components/tariff_calculator";
import { useFinancialForm } from "./_hooks/use_financial_form";
import ExpensesShell from "./_components/expenses_shell";
import OnboardingStepHint from "../_components/onboarding_step_hint";

interface StoredUser {
  id: string;
  profession: string;
  years_of_experience?: string | null;
  country?: string | null;
}

export default function FinancesPage() {
  const form = useFinancialForm();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setStoredUser(JSON.parse(raw));
  }, []);

  return (
    <>
      <SectionHeader
        title="Finanzas"
        subtitle="Configurá tus datos para calcular tarifas"
        icon={<Wallet className="w-8 h-8 text-indigo-600"/>}
      />
      <OnboardingStepHint step="finances" />

      <div className="flex flex-col gap-10 px-4">

        <div className="max-w-2xl w-full">
          <FinancesShell title="Configuración Financiera">
            <FinancialForm {...form} />
          </FinancesShell>
        </div>

        <div className="w-full">
          <FinancesShell title="Gastos">
            <ExpensesShell currency={form.formData.coin_type} />
          </FinancesShell>
        </div>

        <div className="w-full">
          <FinancesShell title="Calculadora de Tarifa Mínima">
            {storedUser ? (
              <TariffCalculator
                user_id={storedUser.id}
                current_hourly_rate={parseFloat(form.formData.hourly_rate as string) || 0}
                coin_type={form.formData.coin_type}
                profession={storedUser.profession}
                years_of_experience={storedUser.years_of_experience ?? null}
                country={storedUser.country ?? null}
              />
            ) : (
              <p className="text-sm text-gray-400 py-4">Iniciá sesión para usar la calculadora.</p>
            )}
          </FinancesShell>
        </div>

      </div>
    </>
  );
}