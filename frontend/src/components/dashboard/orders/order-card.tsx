"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import {
  formatCurrency,
  formatTime,
  groupOrderItems,
  orderTotal,
  relativeTime,
} from "@/lib/order-utils";
import { OrderStatusBadge } from "./order-status-badge";

const PREVIEW_ITEM_LIMIT = 3;

export function OrderCard({
  order,
  isNew,
  now,
  onSelect,
}: {
  order: Order;
  isNew: boolean;
  now: number;
  onSelect: (id: string) => void;
}) {
  const groupedItems = groupOrderItems(order.orderItems);
  const previewItems = groupedItems.slice(0, PREVIEW_ITEM_LIMIT);
  const hiddenItems = groupedItems.length - previewItems.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(order.id)}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        order.status ? "bg-muted/30" : "hover:border-amber-500/50",
        isNew && "border-amber-500 ring-2 ring-amber-500/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Mesa
          </span>
          <span className="text-xl leading-none font-bold">{order.table}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isNew && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
              Novo
            </span>
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {order.name && (
        <p className="truncate text-sm font-medium">{order.name}</p>
      )}

      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {previewItems.map((item) => (
          <li key={item.productId} className="truncate">
            <span className="font-medium text-foreground">{item.amount}×</span>{" "}
            {item.product.name}
          </li>
        ))}
        {hiddenItems > 0 && (
          <li className="text-xs">
            + {hiddenItems} {hiddenItems > 1 ? "itens" : "item"}
          </li>
        )}
        {order.orderItems.length === 0 && (
          <li className="text-xs italic">Sem itens</li>
        )}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatTime(order.createdAt)} · {relativeTime(order.createdAt, now)}
        </span>
        <span className="text-sm font-semibold">
          {formatCurrency(orderTotal(order))}
        </span>
      </div>
    </button>
  );
}
