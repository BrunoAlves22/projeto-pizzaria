"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory, moveCategoryProducts } from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";

export function CategoryRowActions({
  category,
  productCount,
  allCategories,
}: {
  category: Category;
  productCount: number;
  allCategories: Category[];
}) {
  const hasProducts = productCount > 0;
  const otherCategories = allCategories.filter((c) => c.id !== category.id);
  const canMove = otherCategories.length > 0;
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(
    null,
  );

  async function handleConfirm() {
    if (hasProducts) {
      if (!targetCategoryId) {
        throw new Error("Selecione para qual categoria mover os produtos.");
      }
      await moveCategoryProducts(category.id, targetCategoryId);
    }

    await deleteCategory(category.id);
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          title="Excluir categoria"
        />
      }
      triggerContent={
        <>
          <Trash2 />
          <span className="sr-only">Excluir</span>
        </>
      }
      title="Excluir categoria"
      description={
        hasProducts
          ? `A categoria "${category.name}" está vinculada a ${productCount} produto${productCount > 1 ? "s" : ""} (ativo${productCount > 1 ? "s" : ""} ou arquivado${productCount > 1 ? "s" : ""}).`
          : `Tem certeza que deseja excluir "${category.name}"? Essa ação não pode ser desfeita.`
      }
      warning={
        hasProducts
          ? canMove
            ? "Escolha para qual categoria mover esses produtos. Eles serão movidos e só então a categoria será excluída."
            : "Não é possível mover os produtos: essa é a única categoria cadastrada. Crie outra categoria antes de excluir esta."
          : undefined
      }
      hideConfirm={hasProducts && !canMove}
      confirmDisabled={hasProducts && canMove && !targetCategoryId}
      confirmLabel={hasProducts ? "Mover e excluir" : "Excluir categoria"}
      pendingLabel={hasProducts ? "Movendo e excluindo..." : "Excluindo..."}
      onConfirm={handleConfirm}
    >
      {hasProducts && canMove && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`move-products-${category.id}`}>
            Mover produtos para
          </Label>
          <Select
            value={targetCategoryId}
            onValueChange={setTargetCategoryId}
            items={otherCategories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          >
            <SelectTrigger id={`move-products-${category.id}`} className="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {otherCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </ConfirmDialog>
  );
}
