import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    name: z.string({ error: "Nome inválido" }),
    email: z.email({ error: "Email inválido" }),
    password: z
      .string({ error: "Senha é obrigatória" })
      .min(8, { error: "Senha tem que conter 8 caracteres no mínimo" })
      .regex(/[a-z]/, { error: "Senha deve conter ao menos uma letra minúscula" })
      .regex(/[A-Z]/, { error: "Senha deve conter ao menos uma letra maiúscula" })
      .regex(/[0-9]/, { error: "Senha deve conter ao menos um número" }),
  }),
});

export { createUserSchema };

const authUserSchema = z.object({
  body: z.object({
    email: z.string({ error: "Email inválido" }),
    password: z.string({ error: "Senha é obrigatória" }),
  }),
});

export { authUserSchema };
