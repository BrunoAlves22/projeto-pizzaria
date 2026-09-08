"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { assertAdmin, getToken } from "@/lib/auth";
import { Category } from "@/lib/types";

type CategoryState = {
  success: boolean;
  error: string;
};

export async function createCategory(
  prevState: CategoryState | null,
  formData: FormData,
): Promise<CategoryState> {
  await assertAdmin();
  const name = formData.get("name") as string;
  const token = await getToken();

  try {
    await fetchApi<Category>("/category", {
      method: "POST",
      token,
      body: JSON.stringify({ name }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      switch (err.status) {
        case 400:
          return {
            success: false,
            error:
              err.details?.[0]?.message ||
              "Dados inválidos. Verifique o nome informado.",
          };
        case 409:
          return { success: false, error: "Essa categoria já existe." };
        default:
          console.error("Erro ao criar categoria:", err);
          return {
            success: false,
            error: "Não foi possível criar a categoria. Tente novamente.",
          };
      }
    }

    console.error("Erro ao criar categoria:", err);
    return { success: false, error: "Erro de conexão com o servidor" };
  }

  revalidatePath("/dashboard/categories");
  return { success: true, error: "" };
}

export async function deleteCategory(categoryId: string) {
  await assertAdmin();
  const token = await getToken();

  try {
    await fetchApi(`/category?category_id=${encodeURIComponent(categoryId)}`, {
      method: "DELETE",
      token,
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível excluir a categoria.";
    throw new Error(message);
  }

  revalidatePath("/dashboard/categories");
}

export async function moveCategoryProducts(
  categoryId: string,
  targetCategoryId: string,
) {
  await assertAdmin();
  const token = await getToken();

  try {
    await fetchApi("/category/products", {
      method: "PATCH",
      token,
      body: JSON.stringify({ categoryId, targetCategoryId }),
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível mover os produtos.";
    throw new Error(message);
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}
