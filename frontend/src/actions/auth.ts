"use server";

import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";

type RegisterState = {
  success: boolean;
  error: string;
  redirectTo?: string;
};

export async function registerUser(
  prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const data = {
    name,
    email,
    password,
  };

  try {
    await fetchApi("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return { success: true, error: "", redirectTo: "/login" };
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
        case 409:
          return { success: false, error: "Este e-mail já está cadastrado." };
        case 429:
          return {
            success: false,
            error: "Muitas tentativas. Tente novamente mais tarde.",
          };
        default:
          console.error("Erro ao registrar usuário:", err);
          return {
            success: false,
            error: "Não foi possível concluir o cadastro. Tente novamente.",
          };
      }
    }

    console.error("Erro ao registrar usuário:", err);
    return { success: false, error: "Erro de conexão com o servidor" };
  }
}
