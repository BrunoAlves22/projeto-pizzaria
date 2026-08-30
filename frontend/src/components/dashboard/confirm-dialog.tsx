"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
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
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  triggerContent,
  title,
  description,
  confirmLabel,
  pendingLabel = "Processando...",
  destructive = true,
  warning,
  hideConfirm = false,
  confirmDisabled = false,
  children,
  onConfirm,
}: {
  trigger: ReactElement;
  triggerContent: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel?: string;
  destructive?: boolean;
  /** Aviso extra (ex: explicando uma restrição), mostrado em destaque acima do rodapé. */
  warning?: ReactNode;
  /** Quando true, esconde o botão de confirmar (a ação não pode ser concluída de jeito nenhum). */
  hideConfirm?: boolean;
  /** Desabilita o botão de confirmar sem escondê-lo (ex: falta escolher uma opção). */
  confirmDisabled?: boolean;
  /** Conteúdo extra entre a descrição e o rodapé (ex: um seletor). */
  children?: ReactNode;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Algo deu errado. Tente novamente.",
        );
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) return;
        setOpen(nextOpen);
        if (!nextOpen) setError(null);
      }}
    >
      <DialogTrigger render={trigger}>{triggerContent}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {warning && (
          <p className="rounded-md bg-amber-500/10 p-2 text-sm text-amber-700 dark:text-amber-400">
            {warning}
          </p>
        )}

        {children}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" className="cursor-pointer" />}
          >
            {hideConfirm ? "Fechar" : "Cancelar"}
          </DialogClose>
          {!hideConfirm && (
            <Button
              variant={destructive ? "destructive" : "default"}
              disabled={isPending || confirmDisabled}
              onClick={handleConfirm}
              className="cursor-pointer"
            >
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
