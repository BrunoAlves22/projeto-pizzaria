"use client";

import { useCallback, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cancelOrder, finishOrder } from "@/actions/order";
import type { Order } from "@/lib/types";
import { orderTotal, relativeTime } from "@/lib/order-utils";
import { useNow } from "@/hooks/use-now";
import { useOrdersFeed } from "@/hooks/use-orders-feed";
import {
  playNewOrderChime,
  requestNotificationPermission,
  showNewOrderNotification,
} from "./order-alerts";
import { OrderCard } from "./order-card";
import { OrderDetailsSheet } from "./order-details-sheet";
import { OrdersFilterTabs, type OrdersFilter } from "./orders-filter-tabs";
import { OrdersPlaceholder } from "./orders-placeholder";
import { OrdersStats } from "./orders-stats";
import { OrdersToolbar } from "./orders-toolbar";

export function OrdersBoard({
  initialOrders,
  initialError,
}: {
  initialOrders: Order[];
  initialError: string | null;
}) {
  const [filter, setFilter] = useState<OrdersFilter>("preparo");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  const now = useNow();

  const handleNewOrders = useCallback(
    (arrived: Order[]) => {
      if (soundOn) playNewOrderChime();
      showNewOrderNotification(arrived);
    },
    [soundOn],
  );

  const {
    orders,
    error,
    isRefreshing,
    lastUpdated,
    newOrderIds,
    refresh,
    acknowledgeOrder,
    dismissNewOrders,
  } = useOrdersFeed({
    initialOrders,
    initialError,
    autoRefresh,
    onNewOrders: handleNewOrders,
  });

  const emPreparo = useMemo(() => orders.filter((o) => !o.status), [orders]);
  const finalizados = useMemo(() => orders.filter((o) => o.status), [orders]);
  const faturamentoEmPreparo = useMemo(
    () => emPreparo.reduce((sum, o) => sum + orderTotal(o), 0),
    [emPreparo],
  );

  const visibleOrders =
    filter === "preparo"
      ? emPreparo
      : filter === "finalizados"
        ? finalizados
        : orders;

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  function selectOrder(id: string) {
    setSelectedId(id);
    acknowledgeOrder(id);
  }

  async function handleFinish(id: string) {
    await finishOrder(id);
    await refresh();
  }

  async function handleCancel(id: string) {
    await cancelOrder(id);
    setSelectedId(null);
    await refresh();
  }

  function toggleSound() {
    setSoundOn((on) => {
      const next = !on;
      if (next) requestNotificationPermission();
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {emPreparo.length > 0
              ? `${emPreparo.length} pedido${emPreparo.length > 1 ? "s" : ""} em preparo`
              : "Nenhum pedido em preparo no momento."}
            {lastUpdated && (
              <span className="text-muted-foreground/80">
                {" · atualizado "}
                {relativeTime(lastUpdated, now)}
              </span>
            )}
          </p>
        </div>

        <OrdersToolbar
          newCount={newOrderIds.size}
          isRefreshing={isRefreshing}
          autoRefresh={autoRefresh}
          soundOn={soundOn}
          onRefresh={() => void refresh()}
          onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
          onToggleSound={toggleSound}
          onSeeNewOrders={() => {
            setFilter("preparo");
            dismissNewOrders();
          }}
          onDismissNewOrders={dismissNewOrders}
        />
      </div>

      <OrdersStats
        emPreparoCount={emPreparo.length}
        finalizadosCount={finalizados.length}
        faturamentoEmPreparo={faturamentoEmPreparo}
      />

      <OrdersFilterTabs
        value={filter}
        counts={{
          preparo: emPreparo.length,
          finalizados: finalizados.length,
          todos: orders.length,
        }}
        onChange={setFilter}
      />

      {error ? (
        <OrdersPlaceholder
          title="Não foi possível carregar os pedidos"
          description={error}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin")}
            />
            Tentar de novo
          </Button>
        </OrdersPlaceholder>
      ) : visibleOrders.length === 0 ? (
        <OrdersPlaceholder
          title={
            filter === "finalizados"
              ? "Nenhum pedido finalizado ainda"
              : "Nenhum pedido em preparo"
          }
          description="Os pedidos enviados pelo garçom aparecem aqui automaticamente."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newOrderIds.has(order.id)}
              now={now}
              onSelect={selectOrder}
            />
          ))}
        </div>
      )}

      <OrderDetailsSheet
        order={selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />
    </div>
  );
}
