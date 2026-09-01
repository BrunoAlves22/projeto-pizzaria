"use client";

import { cn } from "@/lib/utils";

export type OrdersFilter = "preparo" | "finalizados" | "todos";

const TABS: { key: OrdersFilter; label: string }[] = [
  { key: "preparo", label: "Em preparo" },
  { key: "finalizados", label: "Finalizados" },
  { key: "todos", label: "Todos" },
];

export function OrdersFilterTabs({
  value,
  counts,
  onChange,
}: {
  value: OrdersFilter;
  counts: Record<OrdersFilter, number>;
  onChange: (filter: OrdersFilter) => void;
}) {
  return (
    <div className="flex w-fit gap-1 rounded-lg border bg-muted/40 p-1 text-sm">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors",
            value === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          <span className="ml-1.5 text-xs text-muted-foreground">
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
