"use client";

import RegisterForm from "./_components/register_form";
import StatsFooter from "./_components/stats_footer";
import { useRegisterForm } from "./_hooks/use_register_form";

export default function RegisterPage() {
  const form = useRegisterForm();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-8 py-10">
        <RegisterForm {...form} />
      </div>
      <StatsFooter />
    </main>
  );
}
