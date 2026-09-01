import { fetchOrders } from "@/actions/order";
import { OrdersBoard } from "@/components/dashboard/orders/orders-board";

export default async function DashboardPage() {
  const { orders, error } = await fetchOrders();

  return <OrdersBoard initialOrders={orders} initialError={error} />;
}
