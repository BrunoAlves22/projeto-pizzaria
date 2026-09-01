"use client";

import { Bell, BellOff, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function OrdersToolbar({
  newCount,
  isRefreshing,
  autoRefresh,
  soundOn,
  onRefresh,
  onToggleAutoRefresh,
  onToggleSound,
  onSeeNewOrders,
  onDismissNewOrders,
}: {
  newCount: number;
  isRefreshing: boolean;
  autoRefresh: boolean;
  soundOn: boolean;
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
  onToggleSound: () => void;
  /** Ver os pedidos novos (filtra + marca como vistos). */
  onSeeNewOrders: () => void;
  /** Só marca os pedidos novos como vistos. */
  onDismissNewOrders: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {newCount > 0 && (
        <div className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 py-1 pr-1 pl-3 text-xs font-semibold text-white shadow-sm">
          <button
            type="button"
            onClick={onSeeNewOrders}
            className="inline-flex cursor-pointer items-center gap-1.5"
            title="Ver os pedidos e marcar como vistos"
          >
            <Bell className="size-3.5" />
            {newCount} novo{newCount > 1 ? "s" : ""} pedido
            {newCount > 1 ? "s" : ""}
          </button>
          <button
            type="button"
            onClick={onDismissNewOrders}
            title="Marcar como vistos"
            aria-label="Marcar pedidos novos como vistos"
            className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-white/20"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="cursor-pointer"
      >
        <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
        Atualizar
      </Button>

      <Button
        variant={autoRefresh ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleAutoRefresh}
        className="cursor-pointer"
        title="Verifica novos pedidos automaticamente a cada 15 segundos"
      >
        <span
          className={cn(
            "size-2 rounded-full",
            autoRefresh ? "bg-emerald-500" : "bg-muted-foreground/40",
          )}
        />
        Automático {autoRefresh ? "ligado" : "desligado"}
      </Button>

      <Button
        variant={soundOn ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleSound}
        className="cursor-pointer"
        title="Alerta (som + notificação do sistema) quando chega um pedido novo"
      >
        {soundOn ? (
          <Bell className="size-3.5" />
        ) : (
          <BellOff className="size-3.5" />
        )}
        Alertas
      </Button>
    </div>
  );
}
