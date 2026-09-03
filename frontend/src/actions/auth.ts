"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { LoginUser } from "@/lib/types";
import { getToken, removeToken, setToken } from "@/lib/auth";

type AuthState = {
  success: boolean;
  error: string;
  redirectTo?: string;
};

export async function loginUser(
  prevState: AuthState | null,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const data = {
    email,
    password,
  };

  try {
    const response = await fetchApi<LoginUser>("/session", {
      method: "POST",
      body: JSON.stringify(data),
    });

    await setToken(response.token);
  } catch (err) {
    if (err instanceof ApiError) {
      switch (err.status) {
        case 400:
          return {
            success: false,
            error:
              err.details?.[0]?.message ||
              "Dados inválidos. Verifique os campos preenchidos.",
          };
        case 401:
          return { success: false, error: "Credenciais inválidas." };
        case 429:
          return {
            success: false,
            error: "Muitas tentativas. Tente novamente mais tarde.",
          };
        default:
          console.error("Erro ao fazer login:", err);
          return {
            success: false,
            error: "Não foi possível concluir o login. Tente novamente.",
          };
      }
    }

    console.error("Erro ao fazer login:", err);
    return { success: false, error: "Erro de conexão com o servidor" };
  }

  return { success: true, error: "", redirectTo: "/dashboard" };
}

export async function logoutUser() {
  const token = await getToken();

  if (token) {
    try {
      await fetchApi("/logout", { method: "POST", token });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  }

  await removeToken();
  redirect("/login");
}
