"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type Client = {
  id: string;
  name: string;
  email: string;
  client_type: string;
  phone_number: string;
  address: string;
  website: string;
  extra_info: string;
};

export function useClient(clientId: string) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (res.ok) setClient(data);
    } finally {
      setLoading(false);
    }
  }, [clientId, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return { client, loading, refetch: fetchClient };
}