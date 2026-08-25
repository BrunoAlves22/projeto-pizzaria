import { cache } from "react";
import { cookies } from "next/headers";
import { ApiError } from "./api-error";
import { fetchApi } from "./api";
import { User } from "./types";

const COOKIE_NAME = "token_pizzaria";
const COOKIE_PATH = "/";

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
