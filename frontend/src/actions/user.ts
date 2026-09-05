"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { assertAdmin, getToken } from "@/lib/auth";
import type { AccountUser } from "@/lib/types";

export type UsersResult = {
  users: AccountUser[];
  error: string | null;
};

/** Lista as contas cadastradas (somente ADMIN). */
export async function listUsers(): Promise<UsersResult> {
  await assertAdmin();
  const token = await getToken();

  try {
    const users = await fetchApi<AccountUser[]>("/users", {
      token,
      cache: "no-store",
    });

    return { users, error: null };
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar os usuários.";

    return { users: [], error: message };
  }
}

type CreateUserState = {
  success: boolean;
  error: string;
};

export async function createUser(
  prevState: CreateUserState | null,
  formData: FormData,
): Promise<CreateUserState> {
  await assertAdmin();
  const token = await getToken();

  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const rawRole = formData.get("role");
  const role = rawRole === "ADMIN" || rawRole === "STAFF" ? rawRole : undefined;

  if (!name || !email || !password) {
    return { success: false, error: "Preencha nome, e-mail e senha." };
  }

  try {
    await fetchApi<AccountUser>("/users", {
      method: "POST",
      token,
      body: JSON.stringify({ name, email, password, ...(role ? { role } : {}) }),
    });
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
        case 403:
          return {
            success: false,
            error: "Você não tem permissão para criar usuários.",
          };
        case 409:
          return { success: false, error: "Este e-mail já está cadastrado." };
        default:
          console.error("Erro ao criar usuário:", err);
          return {
            success: false,
            error: "Não foi possível criar o usuário. Tente novamente.",
          };
      }
    }

    console.error("Erro ao criar usuário:", err);
    return { success: false, error: "Erro de conexão com o servidor" };
  }

  revalidatePath("/dashboard/users");
  return { success: true, error: "" };
}
