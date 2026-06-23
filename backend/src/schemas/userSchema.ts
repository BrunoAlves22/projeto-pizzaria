import { z } from "zod";

const createUserSchema = z.object({
  body: z.object({
    name: z.string({ error: "Nome inválido" }),
    email: z.email({ error: "Email inválido" }),
    password: z
      .string({ error: "Senha é obrigatória" })
      .min(6, { error: "Senha tem que conter 6 caracteres no mínimo" }),
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
