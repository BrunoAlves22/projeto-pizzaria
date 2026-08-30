"use client";

import { Archive, Trash2 } from "lucide-react";
import { archiveProduct, deleteProduct } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import type { Product } from "@/lib/types";

export function ProductRowActions({ product }: { product: Product }) {
  return (
    <div className="flex justify-end gap-1">
      {!product.disabled && (
        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              title="Arquivar produto"
            />
          }
          triggerContent={
            <>
              <Archive />
              <span className="sr-only">Arquivar</span>
            </>
          }
          title="Arquivar produto"
          description={`Arquivar "${product.name}"? O produto some do cardápio e não há como reativá-lo por aqui.`}
          confirmLabel="Arquivar"
          pendingLabel="Arquivando..."
          destructive={false}
          onConfirm={() => archiveProduct(product.id)}
        />
      )}

      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Excluir produto"
          />
        }
        triggerContent={
          <>
            <Trash2 />
            <span className="sr-only">Excluir</span>
          </>
        }
        title="Excluir produto"
        description={`Excluir "${product.name}" permanentemente? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo..."
        onConfirm={() => deleteProduct(product.id)}
      />
    </div>
  );
}
