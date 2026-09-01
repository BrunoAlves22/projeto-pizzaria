import { ChefHat, CircleCheck } from "lucide-react";

/** Selo "Em preparo" / "Finalizado" a partir do `status` do pedido. */
export function OrderStatusBadge({ status }: { status: boolean }) {
  return status ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <CircleCheck className="size-3" />
      Finalizado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      <ChefHat className="size-3" />
      Em preparo
    </span>
  );
}
