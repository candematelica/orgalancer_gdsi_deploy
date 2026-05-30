"use client";

import { useState, useEffect } from "react";

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$",
  MXN: "$", BRL: "R$", CLP: "$", COP: "$", JPY: "¥",
};

export function getCurrency(): string {
  const [currency, setCurrency] = useState("$");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw) as { id: string };
    const api = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${api}/finances/${user.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.coin_type) {
          setCurrency(CURRENCY_SYMBOL[data.coin_type] ?? data.coin_type);
        }
      })
      .catch(() => {});
  }, []);

  return currency;
}