"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { createProduct } from "@/actions/product";
import { cn } from "@/lib/utils";
import { PriceInput } from "./price-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Category } from "@/lib/types";

const amberButton =
  "cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500";
const amberFocus =
  "focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20";

function CreateProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Campos controlados: uma action que retorna erro (em vez de lançar) ainda
  // conta como "concluída" pro React, que reseta os campos não controlados do
  // form automaticamente. Mantendo o valor no estado, ele sobrevive a isso.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const previewUrl = useMemo(
    () => (previewFile ? URL.createObjectURL(previewFile) : null),
    [previewFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (state?.success) {
      closeRef.current?.click();
    }
  }, [state]);

  function handleRemoveFile() {
    setPreviewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <form
        action={formAction}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Pizza de calabresa"
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={amberFocus}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Ex: Molho de tomate, calabresa, cebola e azeitonas"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={cn("max-h-32 resize-none overflow-y-auto", amberFocus)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Categoria</Label>
          <Select
            name="categoryId"
            value={categoryId}
            onValueChange={setCategoryId}
            items={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
          >
            <SelectTrigger id="categoryId" className={cn("w-full", amberFocus)}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preço</Label>
          <PriceInput className={amberFocus} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="file">Imagem</Label>
          <Input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(event) =>
              setPreviewFile(event.target.files?.[0] ?? null)
            }
            className={amberFocus}
          />
          {previewUrl && (
            <div className="relative mt-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview local (blob:) não passa pelo otimizador do next/image */}
              <img
                src={previewUrl}
                alt="Pré-visualização da imagem do produto"
                className="h-32 w-full rounded-md border object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 cursor-pointer shadow-sm"
                title="Remover imagem selecionada"
              >
                <X />
                <span className="sr-only">Remover imagem</span>
              </Button>
            </div>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending} className={amberButton}>
            {isPending ? "Criando..." : "Criar produto"}
          </Button>
        </DialogFooter>
      </form>

      <DialogClose
        ref={closeRef}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </>
  );
}

export function CreateProductDialog({
  categories,
}: {
  categories: Category[];
}) {
  // Muda a cada fechamento do diálogo, forçando o formulário a remontar
  // e o useActionState a voltar ao estado inicial (sem erro da tentativa anterior).
  const [formKey, setFormKey] = useState(0);

  if (categories.length === 0) {
    return (
      <Button disabled title="Crie uma categoria antes de cadastrar produtos">
        <Plus />
        Novo produto
      </Button>
    );
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <DialogTrigger render={<Button className={amberButton} />}>
        <Plus />
        Novo produto
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo produto</DialogTitle>
          <DialogDescription>
            Cadastre um produto para exibir no cardápio.
          </DialogDescription>
        </DialogHeader>

        <CreateProductForm key={formKey} categories={categories} />
      </DialogContent>
    </Dialog>
  );
}
