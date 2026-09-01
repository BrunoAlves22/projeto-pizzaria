import { LogOut, ShieldAlert } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card shadow-lg shadow-amber-950/5">
          <CardHeader className="items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-7" />
            </span>
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-2xl text-foreground">
                Acesso negado
              </CardTitle>
              <CardDescription>
                O painel da{" "}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  AS Pizzaria
                </span>{" "}
                é restrito a administradores. Sua conta não tem permissão para
                acessar esta área.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <form action={logoutUser}>
              <Button
                type="submit"
                className="w-full cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-500"
              >
                <LogOut className="size-4" />
                Sair da conta
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Precisa de acesso? Fale com um administrador da AS Pizzaria.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
