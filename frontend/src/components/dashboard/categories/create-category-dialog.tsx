"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createCategory } from "@/actions/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      closeRef.current?.click();
    }
  }, [state]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Pizzas salgadas"
            autoComplete="off"
            className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter>
          <Button
            type="submit"
            disabled={isPending}
            className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {isPending ? "Criando..." : "Criar categoria"}
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

export function CreateCategoryDialog() {
  // Muda a cada fechamento do diálogo, forçando o formulário a remontar
  // e o useActionState a voltar ao estado inicial (sem erro da tentativa anterior).
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500" />
        }
      >
        <Plus />
        Nova categoria
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>
            Crie uma categoria para organizar os produtos do cardápio.
          </DialogDescription>
        </DialogHeader>

        <CreateCategoryForm key={formKey} />
      </DialogContent>
    </Dialog>
  );
}
