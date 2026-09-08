import { Users } from "lucide-react";
import { listUsers } from "@/actions/user";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CreateUserDialog } from "@/components/dashboard/users/create-user-dialog";
import { UserRowActions } from "@/components/dashboard/users/user-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: "ADMIN" | "STAFF" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        role === "ADMIN"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      {role === "ADMIN" ? "Administrador" : "Atendente"}
    </span>
  );
}

export default async function UsersPage() {
  const [{ users, error }, currentUser] = await Promise.all([
    listUsers(),
    getUser(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            {users.length > 0
              ? `${users.length} conta${users.length > 1 ? "s" : ""} cadastrada${users.length > 1 ? "s" : ""}`
              : "Crie as contas dos atendentes e de outros administradores."}
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Users className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Nenhum usuário cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Crie a primeira conta de atendente para começar.
            </p>
          </div>
          <CreateUserDialog />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-b-amber-500/70 bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Nome
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  E-mail
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Cargo
                </TableHead>
                <TableHead className="h-11 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Criado em
                </TableHead>
                <TableHead className="h-11 w-16 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {currentUser?.id === user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserRowActions
                      user={user}
                      isSelf={currentUser?.id === user.id}
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
