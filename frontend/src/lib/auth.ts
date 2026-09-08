import { cache } from "react";
import { cookies } from "next/headers";
import { ApiError } from "./api-error";
import { fetchApi } from "./api";
import { User } from "./types";
import { redirect } from "next/navigation";

const COOKIE_NAME = "token_pizzaria";
const COOKIE_PATH = "/";

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Alinhado ao `expiresIn: "1d"` do JWT no backend — evita manter um cookie
    // válido dias depois do token já ter expirado.
    maxAge: 60 * 60 * 24, // 1 dia
    path: COOKIE_PATH,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeToken() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: COOKIE_NAME, path: COOKIE_PATH });
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    return await fetchApi<User>("/me", {
      token,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    console.error("Error fetching user:", error);
    return null;
  }
});

export async function requiredAdminUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  if (user?.role !== "ADMIN") {
    redirect("/access-denied");
  }
  return user;
}

/**
 * Guarda de autorização para Server Actions.
 * O `proxy.ts` já protege a navegação para `/dashboard`, mas Server Actions são
 * endpoints POST próprios — a doc do Next recomenda revalidar a permissão dentro
 * de cada uma. Lança em vez de redirecionar (redirect em action não é confiável).
 */
export async function assertAdmin(): Promise<User> {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Ação não autorizada.");
  }
  return user;
}
