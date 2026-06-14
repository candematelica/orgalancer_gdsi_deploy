"use client";

import { useState } from "react";

export type ReminderStatus = "idle" | "loading" | "sent" | "error";

export function useReminder(clientId: string) {
  const [status, setStatus] = useState<ReminderStatus>("idle");
  const [error, setError] = useState<string>("");

  const sendReminder = async (receiptId: string) => {
    if (!receiptId || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, invoice_id: receiptId }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar el recordatorio");
        setStatus("error");
      }
    } catch {
      setError("Error de conexión");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError("");
  };

  return { status, error, sendReminder, reset };
}