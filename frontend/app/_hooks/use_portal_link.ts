"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function usePortalLink() {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function generateAndCopyLink(projectId: string) {
        setLoadingId(projectId);
        setError(null);

        try {
            const res = await fetch(`/api/portal/${projectId}/generate-token`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("No se pudo generar el enlace");

            const data = await res.json();
            const portalUrl = `${window.location.origin}/portal/${data.token}`;

            await navigator.clipboard.writeText(portalUrl);
            setCopiedId(projectId);
            setTimeout(() => setCopiedId(null), 2500);
        } catch (err: any) {
            setError(err.message || "Error al generar el enlace");
        } finally {
            setLoadingId(null);
        }
    }

    return { generateAndCopyLink, loadingId, copiedId, error };
}