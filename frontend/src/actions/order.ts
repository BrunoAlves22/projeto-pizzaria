"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Order } from "@/lib/types";

export type OrdersResult = {
  orders: Order[];
  error: string | null;
};

/**
 * Lista os pedidos já enviados para a cozinha (draft = false).
 * Usada tanto no carregamento inicial (server component) quanto no
 * polling do painel para detectar pedidos novos do garçom.
 */
export async function fetchOrders(): Promise<OrdersResult> {
  const token = await getToken();

  try {
    const orders = await fetchApi<Order[]>("/orders?draft=false", {
      token,
      cache: "no-store",
    });

    // Mais recentes primeiro — o pedido novo aparece no topo do painel.
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return { orders, error: null };
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar os pedidos.";

    return { orders: [], error: message };
  }
}

export async function finishOrder(orderId: string): Promise<void> {
  const token = await getToken();

  try {
    await fetchApi("/order/finish", {
      method: "PUT",
      token,
      body: JSON.stringify({ orderId }),
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível finalizar o pedido.";
    throw new Error(message);
  }

  revalidatePath("/dashboard");
}

export async function cancelOrder(orderId: string): Promise<void> {
  const token = await getToken();

  try {
    await fetchApi(`/order/delete?orderId=${encodeURIComponent(orderId)}`, {
      method: "DELETE",
      token,
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível cancelar o pedido.";
    throw new Error(message);
  }

  revalidatePath("/dashboard");
}
