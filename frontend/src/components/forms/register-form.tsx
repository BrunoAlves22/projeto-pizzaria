"use client";

import { useActionState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state?.redirectTo, router]);

  return (
    <div className="w-full max-w-md">
      <Card className="border border-border bg-card shadow-lg shadow-amber-950/5">
        <CardHeader className="items-center gap-1.5 text-center">
          <CardTitle className="text-2xl sm:text-3xl text-foreground select-none">
            AS{" "}
            <span className="text-amber-600 dark:text-amber-400">Pizzaria</span>
          </CardTitle>
          <CardDescription>
            Crie sua conta para fazer seus pedidos
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Digite seu nome..."
                required
                minLength={3}
                className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20 placeholder:text-sm placeholder:text-mist-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Digite seu email..."
                required
                className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20 placeholder:text-sm placeholder:text-mist-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Digite sua senha..."
                required
                className="focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/20 placeholder:text-sm placeholder:text-mist-400"
              />
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {isPending ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center gap-1 bg-muted/40 text-sm text-muted-foreground">
          Já tem uma conta?
          <Link
            href="/login"
            className="font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
