import { Tags } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Category, Product } from "@/lib/types";
import { CreateCategoryDialog } from "@/components/dashboard/categories/create-category-dialog";
import { CategoryRowActions } from "@/components/dashboard/categories/category-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getCategoriesData(): Promise<{
  categories: Category[];
  productCountByCategory: Map<string, number>;
  error: string | null;
}> {
  const token = await getToken();

  try {
    // Busca produtos ativos e arquivados: a exclusão de categoria é bloqueada
    // no backend se houver QUALQUER produto vinculado, independente do status.
    const [categories, activeProducts, archivedProducts] = await Promise.all([
      fetchApi<Category[]>("/category-list", { token, cache: "no-store" }),
      fetchApi<Product[]>("/products?disabled=false", {
        token,
        cache: "no-store",
      }),
      fetchApi<Product[]>("/products?disabled=true", {
        token,
        cache: "no-store",
      }),
    ]);

    const productCountByCategory = new Map<string, number>();
    for (const product of [...activeProducts, ...archivedProducts]) {
      productCountByCategory.set(
        product.categoryId,
        (productCountByCategory.get(product.categoryId) ?? 0) + 1,
      );
    }

    return { categories, productCountByCategory, error: null };
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar as categorias.";

    return { categories: [], productCountByCategory: new Map(), error: message };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function CategoriesPage() {
  const { categories, productCountByCategory, error } =
    await getCategoriesData();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Categorias
          </h1>
          <p className="text-sm text-muted-foreground">
            {categories.length > 0
              ? `${categories.length} categoria${categories.length > 1 ? "s" : ""} cadastrada${categories.length > 1 ? "s" : ""}`
              : "Organize o cardápio separando os produtos por categoria."}
          </p>
        </div>
        <CreateCategoryDialog />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Tags className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Nenhuma categoria cadastrada</p>
            <p className="text-sm text-muted-foreground">
              Crie a primeira categoria para começar a organizar o cardápio.
            </p>
          </div>
          <CreateCategoryDialog />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-b-amber-500/70 bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Nome
                </TableHead>
                <TableHead className="h-11 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Criada em
                </TableHead>
                <TableHead className="h-11 w-16 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <CategoryRowActions
                      category={category}
                      productCount={productCountByCategory.get(category.id) ?? 0}
                      allCategories={categories}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
