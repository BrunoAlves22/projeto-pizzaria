"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { loginUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state?.redirectTo, router]);

  return (
    <AuthCard
      description="Entre na sua conta para fazer seus pedidos"
      footerText="Ainda não tem uma conta?"
      footerLinkHref="/register"
      footerLinkText="Criar conta"
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="Digite seu email..."
            required
            className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20 placeholder:text-sm placeholder:text-mist-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Digite sua senha..."
              required
              className="pr-10 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20 placeholder:text-sm placeholder:text-mist-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="mt-2 w-full bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        {state?.error && (
          <p className="mt-2 text-sm bg-red-200 rounded-md p-1 w-fit text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
      </form>
    </AuthCard>
  );
}
