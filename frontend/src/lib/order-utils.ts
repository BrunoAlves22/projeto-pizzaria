import type { Order, OrderItem } from "@/lib/types";

export function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "agora mesmo", "há 5 min", "há 2 h"… a partir de `now` (Date.now()). */
export function relativeTime(value: string | number | Date, now: number) {
  const diffMin = Math.floor((now - new Date(value).getTime()) / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  return `há ${Math.floor(diffH / 24)} d`;
}

/** Valor total do pedido, em centavos. */
export function orderTotal(order: Order) {
  return order.orderItems.reduce(
    (sum, item) => sum + item.amount * item.product.price,
    0,
  );
}

/** Quantidade somada de unidades do pedido. */
export function orderItemCount(order: Order) {
  return order.orderItems.reduce((sum, item) => sum + item.amount, 0);
}

export type GroupedOrderItem = {
  productId: string;
  product: OrderItem["product"];
  amount: number;
  /** ids dos OrderItem originais que foram somados nesta linha. */
  itemIds: string[];
};

/**
 * Junta itens do mesmo produto numa linha só, somando as quantidades. O backend
 * cria um OrderItem novo a cada `POST /order/add`, mesmo quando o produto se
 * repete — aqui consolidamos para exibição, preservando a ordem de entrada.
 */
export function groupOrderItems(items: OrderItem[]): GroupedOrderItem[] {
  const byProduct = new Map<string, GroupedOrderItem>();

  for (const item of items) {
    const existing = byProduct.get(item.product.id);
    if (existing) {
      existing.amount += item.amount;
      existing.itemIds.push(item.id);
    } else {
      byProduct.set(item.product.id, {
        productId: item.product.id,
        product: item.product,
        amount: item.amount,
        itemIds: [item.id],
      });
    }
  }

  return [...byProduct.values()];
}
