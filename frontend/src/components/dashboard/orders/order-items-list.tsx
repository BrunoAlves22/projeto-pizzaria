import Image from "next/image";
import { ChefHat } from "lucide-react";
import type { OrderItem } from "@/lib/types";
import { formatCurrency } from "@/lib/order-utils";

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Este pedido não tem itens.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {item.product.banner ? (
              <Image
                src={item.product.banner}
                alt={item.product.name}
                width={48}
                height={48}
                className="size-full object-cover"
              />
            ) : (
              <ChefHat className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatCurrency(item.product.price)} un.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">×{item.amount}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(item.amount * item.product.price)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
