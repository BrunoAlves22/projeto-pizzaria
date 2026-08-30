export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

export interface RegisterUser extends User {
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
