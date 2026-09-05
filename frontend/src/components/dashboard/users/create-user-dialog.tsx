"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { createUser } from "@/actions/user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const amberButton =
  "cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500";
const amberFocus =
  "focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20";

const roleOptions = [
  { value: "STAFF", label: "Atendente (garçom)" },
  { value: "ADMIN", label: "Administrador" },
];

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string | null>("STAFF");

  useEffect(() => {
    if (state?.success) {
      // O diálogo fecha aqui; CreateUserDialog remonta o form (via formKey),
      // então os campos e o select de cargo voltam ao estado inicial.
      formRef.current?.reset();
      closeRef.current?.click();
    }
  }, [state]);

  return (
    <>
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Maria Souza"
            autoComplete="off"
            minLength={3}
            className={amberFocus}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="maria@aspizzaria.com"
            autoComplete="off"
            className={amberFocus}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Senha temporária"
              className={cn("pr-10", amberFocus)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Mínimo de 8 caracteres</li>
            <li>Uma letra maiúscula, uma minúscula e um número</li>
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Cargo</Label>
          <Select
            name="role"
            value={role}
            onValueChange={setRole}
            items={roleOptions}
          >
            <SelectTrigger id="role" className={cn("w-full", amberFocus)}>
              <SelectValue placeholder="Selecione o cargo" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            O atendente usa o app para anotar pedidos. O administrador também
            acessa este painel.
          </p>
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending} className={amberButton}>
            {isPending ? "Criando..." : "Criar usuário"}
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

export function CreateUserDialog() {
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
      <DialogTrigger render={<Button className={amberButton} />}>
        <Plus />
        Novo usuário
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Crie a conta de um atendente ou de outro administrador.
          </DialogDescription>
        </DialogHeader>

        <CreateUserForm key={formKey} />
      </DialogContent>
    </Dialog>
  );
}
