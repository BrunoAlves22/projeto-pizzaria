export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

/** Usuário como retornado por `GET /users` e `POST /users` (sem senha/token). */
export interface AccountUser extends User {
  createdAt: string;
}

export interface LoginUser extends User {
  token: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  banner: string;
  disabled: boolean;
  categoryId: string;
  createdAt: string;
}

export interface OrderItemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  banner: string;
}

export interface OrderItem {
  id: string;
  amount: number;
  product: OrderItemProduct;
}

export interface Order {
  id: string;
  table: number;
  name: string | null;
  /** `true` enquanto o garçom monta o pedido; `false` depois de enviado para a cozinha. */
  draft: boolean;
  /** `true` quando o pedido foi finalizado. */
  status: boolean;
  createdAt: string;
  orderItems: OrderItem[];
}
