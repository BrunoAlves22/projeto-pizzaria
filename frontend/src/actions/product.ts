"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { assertAdmin, getToken } from "@/lib/auth";
import { Product } from "@/lib/types";

type ProductState = {
  success: boolean;
  error: string;
};

export async function createProduct(
  prevState: ProductState | null,
  formData: FormData,
): Promise<ProductState> {
  await assertAdmin();
  const token = await getToken();

  const name = (formData.get("name") as string) ?? "";
  const categoryId = (formData.get("categoryId") as string) ?? "";
  const rawPrice = (formData.get("price") as string) ?? "";
  const file = formData.get("file");

  const missingFields = [
    !name.trim() && "nome",
    !categoryId && "categoria",
    !rawPrice && "preço",
    (!(file instanceof File) || file.size === 0) && "imagem",
  ].filter((field): field is string => Boolean(field));

  if (missingFields.length > 1) {
    return { success: false, error: "Preencha todos os campos obrigatórios." };
  }

  if (missingFields.length === 1) {
    return {
      success: false,
      error: `O campo "${missingFields[0]}" é obrigatório.`,
    };
  }

  // O PriceInput já envia o valor em centavos (só dígitos), pronto para o backend.
  const priceInCents = Number(rawPrice);

  if (!Number.isInteger(priceInCents) || priceInCents <= 0) {
    return { success: false, error: "Informe um preço válido." };
  }

  try {
    await fetchApi<Product>("/product", {
      method: "POST",
      token,
      body: formData,
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
        case 404:
          return { success: false, error: "Categoria não encontrada." };
        case 502:
          return {
            success: false,
            error: "Não foi possível enviar a imagem. Tente novamente.",
          };
        default:
          console.error("Erro ao criar produto:", err);
          return {
            success: false,
            error: "Não foi possível criar o produto. Tente novamente.",
          };
      }
    }

    console.error("Erro ao criar produto:", err);
    return { success: false, error: "Erro de conexão com o servidor" };
  }

  revalidatePath("/dashboard/products");
  return { success: true, error: "" };
}

export async function archiveProduct(productId: string) {
  await assertAdmin();
  const token = await getToken();

  try {
    await fetchApi(`/product?product_id=${encodeURIComponent(productId)}`, {
      method: "PATCH",
      token,
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível arquivar o produto.";
    throw new Error(message);
  }

  revalidatePath("/dashboard/products");
}

export async function deleteProduct(productId: string) {
  await assertAdmin();
  const token = await getToken();

  try {
    await fetchApi(`/product?product_id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
      token,
    });
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível excluir o produto.";
    throw new Error(message);
  }

  revalidatePath("/dashboard/products");
}
