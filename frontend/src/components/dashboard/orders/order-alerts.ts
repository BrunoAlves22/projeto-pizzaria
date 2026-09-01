import type { Order } from "@/lib/types";

/** Toque curto de dois tons quando um pedido novo entra no painel. */
export function playNewOrderChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const start = ctx.currentTime;

    [880, 1174.7].forEach((freq, i) => {
      const at = start + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.4);
    });

    window.setTimeout(() => void ctx.close().catch(() => {}), 1200);
  } catch {
    // som é só um extra; se o navegador bloquear, seguimos sem ele
  }
}

function notificationsSupported() {
  return typeof Notification !== "undefined";
}

/** Pede a permissão de notificação do sistema, se ainda não foi decidida. */
export function requestNotificationPermission() {
  if (notificationsSupported() && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/** Mostra — e fecha depois de alguns segundos — uma notificação do sistema. */
export function showNewOrderNotification(arrived: Order[]) {
  if (arrived.length === 0) return;
  if (!notificationsSupported() || Notification.permission !== "granted") return;

  const [first] = arrived;
  const notification = new Notification(
    arrived.length === 1
      ? "Novo pedido recebido"
      : `${arrived.length} novos pedidos`,
    {
      body:
        arrived.length === 1
          ? `Mesa ${first.table} · ${first.name ?? "sem nome"}`
          : "Confira o painel de pedidos.",
      // Substitui a notificação anterior em vez de empilhar várias.
      tag: "pedido-novo",
    },
  );
  window.setTimeout(() => notification.close(), 6000);
}
