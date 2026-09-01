import type { ReactNode } from "react";
import { ChefHat, Receipt, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/order-utils";

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          accent
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function OrdersStats({
  emPreparoCount,
  finalizadosCount,
  faturamentoEmPreparo,
}: {
  emPreparoCount: number;
  finalizadosCount: number;
  /** Soma dos pedidos em preparo, em centavos. */
  faturamentoEmPreparo: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        icon={<ChefHat className="size-4" />}
        label="Em preparo"
        value={emPreparoCount}
        accent
      />
      <StatCard
        icon={<Receipt className="size-4" />}
        label="Finalizados"
        value={finalizadosCount}
      />
      <StatCard
        icon={<Utensils className="size-4" />}
        label="A receber (em preparo)"
        value={formatCurrency(faturamentoEmPreparo)}
      />
    </div>
  );
}
