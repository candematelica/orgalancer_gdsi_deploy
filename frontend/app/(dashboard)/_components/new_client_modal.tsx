"use client";

import { useState } from "react";

type ClientForm = {
    name: string;
    email: string;
    client_type: string;
    phone_number: string;
    address: string;
    website: string;
    extra_info: string;
};

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

const CLIENT_TYPES = [
    "Empresa",
    "Autónomo / Freelancer",
    "ONG / Fundación",
    "Particular",
    "Agencia",
    "Otro",
];

export default function NewClientModal({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState<ClientForm>({
        name: "",
        email: "",
        client_type: "",
        phone_number: "",
        address: "",
        website: "",
        extra_info: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.client_type) {
            setError("Nombre, email y tipo de cliente son obligatorios");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("El email no tiene un formato válido");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al guardar el cliente");
                return;
            }

            onSuccess();
            onClose();
        } catch {
            setError("Error de conexión, intentá de nuevo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Nuevo cliente</h2>
                        <p className="text-sm text-gray-400">Completá los datos del cliente</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                            {error}
                        </div>
                    )}

                    <p className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                        Obligatorios
                    </p>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre o razón social
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ej: TechStartup SL"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email de contacto
                        </label>
                        <input
                            type="text"
                            name="email"
                            placeholder="cliente@empresa.com"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Client type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de cliente
                        </label>
                        <select
                            name="client_type"
                            value={form.client_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                        >
                            <option value="" disabled>Seleccioná un tipo</option>
                            {CLIENT_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-2">
                        Opcionales
                    </p>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="+54 11 1234-5678"
                            value={form.phone_number}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección
                        </label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Av. Corrientes 1234, CABA"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sitio web
                        </label>
                        <input
                            type="text"
                            name="website"
                            placeholder="https://www.empresa.com"
                            value={form.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Extra info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas internas
                        </label>
                        <textarea
                            name="extra_info"
                            placeholder="Información relevante solo visible para vos..."
                            value={form.extra_info}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : "Guardar cliente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}