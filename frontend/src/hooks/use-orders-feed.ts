"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOrders } from "@/actions/order";
import type { Order } from "@/lib/types";

const REFRESH_INTERVAL_MS = 15_000;

type UseOrdersFeedOptions = {
  initialOrders: Order[];
  initialError: string | null;
  /** Liga/desliga o polling automático. */
  autoRefresh: boolean;
  /** Chamado quando o polling encontra pedidos que ainda não estavam na lista. */
  onNewOrders?: (arrived: Order[]) => void;
};

/**
 * Mantém a lista de pedidos sincronizada com o backend: carga inicial vinda do
 * server component, polling enquanto a aba está visível, re-sincronização ao
 * voltar o foco e rastreio de quais pedidos são "novos" (ainda não vistos).
 */
export function useOrdersFeed({
  initialOrders,
  initialError,
  autoRefresh,
  onNewOrders,
}: UseOrdersFeedOptions) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [error, setError] = useState<string | null>(initialError);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    initialError ? null : new Date(),
  );
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  const knownIdsRef = useRef<Set<string>>(
    new Set(initialOrders.map((o) => o.id)),
  );

  const onNewOrdersRef = useRef(onNewOrders);
  useEffect(() => {
    onNewOrdersRef.current = onNewOrders;
  }, [onNewOrders]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const result = await fetchOrders();
    setIsRefreshing(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    setLastUpdated(new Date());

    const known = knownIdsRef.current;
    const arrived = result.orders.filter((o) => !known.has(o.id));
    knownIdsRef.current = new Set(result.orders.map((o) => o.id));

    if (arrived.length > 0) {
      setNewOrderIds((prev) => {
        const next = new Set(prev);
        arrived.forEach((o) => next.add(o.id));
        return next;
      });
      onNewOrdersRef.current?.(arrived);
    }

    setOrders(result.orders);
  }, []);

  // Mantém o timer/listener sempre com a versão atual de `refresh`.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Polling enquanto a aba estiver visível.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshRef.current();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh]);

  // Sincroniza assim que a aba volta a ficar em foco.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") void refreshRef.current();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  /** Marca um pedido específico como visto (ex: ao abrir os detalhes). */
  const acknowledgeOrder = useCallback((id: string) => {
    setNewOrderIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /** Marca todos os pedidos novos como vistos. */
  const dismissNewOrders = useCallback(() => setNewOrderIds(new Set()), []);

  return {
    orders,
    error,
    isRefreshing,
    lastUpdated,
    newOrderIds,
    refresh,
    acknowledgeOrder,
    dismissNewOrders,
  };
}
