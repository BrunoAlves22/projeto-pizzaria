"use client";

import { useCallback, useState, useTransition } from "react";

type UseOrderActionsOptions = {
  onFinish: (orderId: string) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  /** Chamado depois de finalizar com sucesso (ex: fechar o painel). */
  onFinished?: () => void;
};

/**
 * Encapsula as transições de "finalizar" e "cancelar" um pedido, com estado de
 * carregamento por ação e uma única mensagem de erro compartilhada.
 */
export function useOrderActions({
  onFinish,
  onCancel,
  onFinished,
}: UseOrderActionsOptions) {
  const [isFinishing, startFinish] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => setError(null), []);

  function finish(orderId: string) {
    setError(null);
    startFinish(async () => {
      try {
        await onFinish(orderId);
        onFinished?.();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível finalizar o pedido.",
        );
      }
    });
  }

  function cancel(orderId: string) {
    setError(null);
    startCancel(async () => {
      try {
        await onCancel(orderId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível cancelar o pedido.",
        );
      }
    });
  }

  return {
    finish,
    cancel,
    isFinishing,
    isCancelling,
    busy: isFinishing || isCancelling,
    error,
    reset,
  };
}
