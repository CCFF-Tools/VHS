"use client";

import useSWR from "swr";
import type { OpsSummaryResponse, TapeRecord } from "@/lib/types";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed");
  }
  return res.json();
};

export function useOpsSummary() {
  return useSWR<OpsSummaryResponse>("/api/ops/summary", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });
}

export function useTapes(queryString: string) {
  return useSWR<{ items: TapeRecord[]; total: number }>(`/api/tapes?${queryString}`, fetcher, {
    refreshInterval: 15000,
  });
}

export function useTape(id: string) {
  return useSWR<{ tape: TapeRecord; related: TapeRecord[] }>(id ? `/api/tapes/${id}` : null, fetcher);
}
