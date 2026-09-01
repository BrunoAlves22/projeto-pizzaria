"use client";

import { useState } from "react";
import { Check, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Order } from "@/lib/types";
import {
  formatCurrency,
  formatDateTime,
  orderItemCount,
  orderTotal,
} from "@/lib/order-utils";
import { useOrderActions } from "@/hooks/use-order-actions";
import { OrderItemsList } from "./order-items-list";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderDetailsSheet({
  order,
  onOpenChange,
  onFinish,
  onCancel,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onFinish: (orderId: string) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
}) {
  const { finish, cancel, isFinishing, isCancelling, busy, error, reset } =
    useOrderActions({
      onFinish,
      onCancel,
      onFinished: () => onOpenChange(false),
    });

  const [confirmCancel, setConfirmCancel] = useState(false);

  // Reseta o estado local sempre que o pedido em foco muda (ajuste de estado
  // durante a renderização — sem efeito).
  const [trackedId, setTrackedId] = useState(order?.id);
  if (order?.id !== trackedId) {
    setTrackedId(order?.id);
    setConfirmCancel(false);
    reset();
  }

  return (
    <Sheet
      open={!!order}
      onOpenChange={(open) => {
        if (busy) return;
        onOpenChange(open);
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-md data-[side=right]:sm:max-w-md">
        {order && (
          <>
            <SheetHeader className="gap-1 border-b">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">Mesa {order.table}</SheetTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <SheetDescription className="flex flex-col gap-0.5">
                <span>{order.name ? order.name : "Cliente não informado"}</span>
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="size-3" />
                  Recebido em {formatDateTime(order.createdAt)}
                </span>
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-medium tracking-wider text-muted-foreground uppercase">
                <span>Itens do pedido</span>
                <span>{orderItemCount(order)} un.</span>
              </div>
              <OrderItemsList items={order.orderItems} />
            </div>

            <div className="border-t px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(orderTotal(order))}
                </span>
              </div>
            </div>

            {error && (
              <p className="px-4 pt-2 text-sm text-destructive">{error}</p>
            )}

            <SheetFooter className="border-t">
              {!order.status && (
                <Button
                  onClick={() => finish(order.id)}
                  disabled={busy}
                  className="w-full cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {isFinishing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {isFinishing ? "Finalizando..." : "Finalizar pedido"}
                </Button>
              )}

              {confirmCancel ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmCancel(false)}
                    disabled={busy}
                    className="flex-1 cursor-pointer"
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => cancel(order.id)}
                    disabled={busy}
                    className="flex-1 cursor-pointer"
                  >
                    {isCancelling ? "Cancelando..." : "Confirmar"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setConfirmCancel(true)}
                  disabled={busy}
                  className="w-full cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                  Cancelar pedido
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
