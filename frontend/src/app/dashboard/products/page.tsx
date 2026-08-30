import Image from "next/image";
import { Package } from "lucide-react";
import { ApiError } from "@/lib/api-error";
import { fetchApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Category, Product } from "@/lib/types";
import { CreateProductDialog } from "@/components/dashboard/products/create-product-dialog";
import { ProductRowActions } from "@/components/dashboard/products/product-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getProductsData(): Promise<{
  products: Product[];
  categories: Category[];
  error: string | null;
}> {
  const token = await getToken();

  try {
    const [products, categories] = await Promise.all([
      fetchApi<Product[]>("/products", { token, cache: "no-store" }),
      fetchApi<Category[]>("/category-list", { token, cache: "no-store" }),
    ]);

    return { products, categories, error: null };
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    const message =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar os produtos.";

    return { products: [], categories: [], error: message };
  }
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ProductThumbnail({
  product,
  size,
}: {
  product: Product;
  size: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
      style={{ width: size, height: size }}
    >
      <Image
        src={product.banner}
        alt={product.name}
        width={size}
        height={size}
        className="size-full object-cover"
      />
    </div>
  );
}

export default async function ProductsPage() {
  const { products, categories, error } = await getProductsData();
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length > 0
              ? `${products.length} produto${products.length > 1 ? "s" : ""} ativo${products.length > 1 ? "s" : ""}`
              : "Cadastre os produtos que aparecerão no cardápio."}
          </p>
        </div>
        <CreateProductDialog categories={categories} />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Package className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Nenhum produto cadastrado</p>
            <p className="text-sm text-muted-foreground">
              {categories.length === 0
                ? "Crie uma categoria antes de cadastrar o primeiro produto."
                : "Crie o primeiro produto para começar a montar o cardápio."}
            </p>
          </div>
          <CreateProductDialog categories={categories} />
        </div>
      ) : (
        <>
          {/* Mobile: lista em cards, sem precisar arrastar a tabela pro lado */}
          <div className="flex flex-col gap-3 sm:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <ProductThumbnail product={product} size={56} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {categoryNameById.get(product.categoryId) ?? "—"}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <ProductRowActions product={product} />
              </div>
            ))}
          </div>

          {/* Telas maiores: tabela completa */}
          <div className="hidden overflow-hidden rounded-xl border sm:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-b-amber-500/70 bg-muted/60 hover:bg-muted/60">
                  <TableHead className="h-11 w-16 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Imagem
                  </TableHead>
                  <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Nome
                  </TableHead>
                  <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Categoria
                  </TableHead>
                  <TableHead className="h-11 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Preço
                  </TableHead>
                  <TableHead className="h-11 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Criado em
                  </TableHead>
                  <TableHead className="h-11 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <ProductThumbnail product={product} size={40} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {categoryNameById.get(product.categoryId) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>
                    <TableCell>
                      <ProductRowActions product={product} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
