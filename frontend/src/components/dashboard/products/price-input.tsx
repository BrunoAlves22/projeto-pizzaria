"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatCentsToBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PriceInput({ className }: { className?: string }) {
  const [digits, setDigits] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Mantém só dígitos e trata o valor como centavos (ex: "4590" -> R$ 45,90).
    setDigits(event.target.value.replace(/\D/g, "").slice(0, 9));
  }

  return (
    <>
      <Input
        id="price"
        type="text"
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={digits ? formatCentsToBRL(Number(digits)) : ""}
        onChange={handleChange}
        className={cn(className)}
      />
      <input type="hidden" name="price" value={digits} />
    </>
  );
}
