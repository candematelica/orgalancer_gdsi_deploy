"use client";

import FinancesHeader from "./_components/finances_header";
import FinancesShell from "./_components/finances_shell";
import FinancialForm from "./_components/financial_form";
import { useFinancialForm } from "./_hooks/use_financial_form";

export default function FinancesPage() {
  const form = useFinancialForm();

  return (
    <>
      <FinancesHeader
        title="Finanzas"
        subtitle="Configurá tus datos para calcular tarifas"
      />
      <div className="max-w-2xl">   {/* ← esto */}
        <FinancesShell title="Configuración Financiera">
          <FinancialForm {...form} />
        </FinancesShell>
      </div>
    </>
  );
}