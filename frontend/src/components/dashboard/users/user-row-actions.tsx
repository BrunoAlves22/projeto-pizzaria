"use client";

import { Trash2 } from "lucide-react";
import { deleteUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import type { AccountUser } from "@/lib/types";

export function UserRowActions({
  user,
  isSelf,
}: {
  user: AccountUser;
  isSelf: boolean;
}) {
  // Você não exclui a própria conta pelo painel (o backend também bloqueia).
  if (isSelf) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
          title="Excluir usuário"
        />
      }
      triggerContent={
        <>
          <Trash2 />
          <span className="sr-only">Excluir</span>
        </>
      }
      title="Excluir usuário"
      description={`Excluir a conta de "${user.name}" (${user.email})? Essa ação não pode ser desfeita e encerra o acesso da pessoa imediatamente.`}
      warning={
        user.role === "ADMIN"
          ? "Esta é uma conta de administrador. A exclusão é bloqueada se for o último administrador."
          : undefined
      }
      confirmLabel="Excluir usuário"
      pendingLabel="Excluindo..."
      onConfirm={() => deleteUser(user.id)}
    />
  );
}
