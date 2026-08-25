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
