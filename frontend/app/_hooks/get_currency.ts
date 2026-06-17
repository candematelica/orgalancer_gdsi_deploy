"use client";

import { useState, useEffect } from "react";

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", ARS: "$",
  MXN: "$", BRL: "R$", CLP: "$", COP: "$", JPY: "¥",
};

export function getCurrency(): string {
  const [currency, setCurrency] = useState("$");

  useEffect(() => {
    fetch("/api/finances")
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