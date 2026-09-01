"use client";

import { useEffect, useState } from "react";

/**
 * Timestamp que se atualiza sozinho a cada `intervalMs`, para manter rótulos
 * relativos ("há 5 min") frescos sem acoplar isso a outra lógica.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
