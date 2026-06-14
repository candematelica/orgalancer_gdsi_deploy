"use client";

import { useState } from "react";

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan?: "free" | "pro" | "business";
}

const PLANS = {
    monthly: {
        free: { price: 0, label: "Gratis" },
        pro: { price: 9, label: "Pro" },
        business: { price: 24, label: "Business" },
    },
    annual: {
        free: { price: 0, label: "Gratis" },
        pro: { price: 7.2, label: "Pro" },
        business: { price: 19.2, label: "Business" },
    },
};

const FREE_FEATURES = [
    { text: "Hasta 3 proyectos activos", available: true },
    { text: "Hasta 5 clientes", available: true },
    { text: "Presupuestos manuales (crear, editar y enviar por email)", available: true },
    { text: "Seguimiento de tiempo y registro de ingresos/gastos", available: true },
    { text: "Portal del cliente: solo progreso del proyecto", available: true },
    { text: "1 recordatorio manual por proyecto", available: true },
    { text: "Generación de presupuestos con IA", available: false },
    { text: "Reportes avanzados", available: false },
    { text: "Recibos descargables", available: false },
];

const PRO_FEATURES = [
    { text: "Proyectos y clientes ilimitados", available: true },
    { text: "Generación de presupuestos con IA (hasta 20/mes)", available: true },
    { text: "Reportes avanzados: cash-flow y profitability", available: true },
    { text: "Portal del cliente completo + recibos descargables", available: true },
    { text: "Recordatorios de pago a clientes", available: true },
    { text: "Aprobación de presupuesto en portal", available: false },
    { text: "Generación de IA ilimitada", available: false },
];

const BUSINESS_FEATURES = [
    { text: "Todo lo de Pro", available: true },
    { text: "Generación de presupuestos con IA ilimitada", available: true },
    { text: "El cliente aprueba presupuestos en el portal", available: true },
    { text: "Envío y edición in-App de presupuestos con IA", available: true },
    { text: "Y mucho más...", available: true },
];

function CheckIcon({ available }: { available: boolean }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`flex-shrink-0 mt-0.5 ${available ? "text-green-500" : "text-gray-300"}`}
        >
            <path
                d="M3 8L6.5 11.5L13 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function UpgradePlanModal({
    isOpen,
    onClose,
    currentPlan = "pro",
}: UpgradePlanModalProps) {
    const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

    if (!isOpen) return null;

    const prices = PLANS[billing];
    const proPrice = billing === "annual" ? "7,20" : "9";
    const businessPrice = billing === "annual" ? "19,20" : "24";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-violet-600">Actualizar plan</h2>
                            <p className="text-base text-gray-500 mt-1">
                                Plan actual:{" "}
                                <span className="text-violet-500 font-semibold">
                                    {currentPlan === "free" ? "Free" : currentPlan === "pro" ? "Pro" : "Business"}
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Billing toggle */}
                            <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 text-sm">
                                <button
                                    onClick={() => setBilling("monthly")}
                                    className={`px-3 py-1 rounded-full transition-all ${billing === "monthly"
                                            ? "bg-violet-50 text-violet-700 font-semibold border border-violet-200"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setBilling("annual")}
                                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${billing === "annual"
                                            ? "bg-violet-600 text-white font-semibold"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Anual
                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                        -20%
                                    </span>
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M18 6L6 18M6 6L18 18"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Plans grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* FREE */}
                        <div
                            className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:shadow-gray-200 hover:z-10 ${currentPlan === "free"
                                    ? "border-violet-200 bg-violet-50/40"
                                    : "border-gray-100 bg-white"
                                }`}
                        >
                            {currentPlan === "free" && (
                                <span className="absolute -top-3 left-4 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Plan actual
                                </span>
                            )}

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M13 10V3L4 14H11V21L20 10H13Z"
                                            stroke="#9CA3AF"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gratis</p>
                                    <p className="text-2xl font-bold text-gray-800">$0</p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 flex-1 mb-5">
                                {FREE_FEATURES.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckIcon available={f.available} />
                                        <span
                                            className={`text-sm leading-relaxed ${f.available ? "text-gray-600" : "text-gray-300 line-through"
                                                }`}
                                        >
                                            {f.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled
                                className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-transparent border border-gray-200 cursor-default"
                            >
                                Superado por tu plan actual
                            </button>
                        </div>

                        {/* PRO */}
                        <div className="relative rounded-2xl border-2 border-violet-500 bg-white p-6 flex flex-col shadow-lg shadow-violet-100 transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-200 hover:z-10">
                            {currentPlan === "pro" ? (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    Plan actual
                                </span>
                            ) : (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                    Más popular
                                </span>
                            )}

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                            stroke="#7C3AED"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pro</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${proPrice}
                                        <span className="text-sm font-normal text-gray-400">/mes</span>
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 flex-1 mb-5">
                                {PRO_FEATURES.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckIcon available={f.available} />
                                        <span
                                            className={`text-sm leading-relaxed ${f.available ? "text-gray-600" : "text-gray-300 line-through"
                                                }`}
                                        >
                                            {f.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {currentPlan === "pro" ? (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-violet-400 bg-transparent border border-violet-200 cursor-default"
                                >
                                    Plan activo
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-transparent border border-gray-200 cursor-default"
                                >
                                    Superado por tu plan actual
                                </button>
                            )}
                        </div>

                        {/* BUSINESS */}
                        <div className="relative rounded-2xl border-2 border-gray-100 bg-white p-6 flex flex-col transition-all duration-200 cursor-pointer hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-100 hover:z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M12 6C12 6 8 8 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 8 12 6 12 6Z"
                                            stroke="#F59E0B"
                                            strokeWidth="1.5"
                                        />
                                        <path
                                            d="M5 3L3 5M19 3L21 5M12 1V3M3 12H1M21 12H23"
                                            stroke="#F59E0B"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Business</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${businessPrice}
                                        <span className="text-sm font-normal text-gray-400">/mes</span>
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-2.5 flex-1 mb-5">
                                {BUSINESS_FEATURES.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckIcon available={f.available} />
                                        <span className="text-sm text-gray-600 leading-relaxed">{f.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-orange-400 hover:bg-orange-500 transition-colors">
                                Plan actual
                            </button>
                        </div>
                    </div>

                    {/* Annual savings note */}
                    {billing === "annual" && (
                        <p className="text-center text-sm text-green-600 font-semibold mt-4">
                            Ahorrás 2 meses con la facturación anual 🎉
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}