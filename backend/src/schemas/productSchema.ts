import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: "O nome do produto é obrigatório" }),
    description: z
      .string()
      .min(1, { error: "A descrição do produto é obrigatória" }),
    price: z
      .string()
      .min(1, { error: "O preço do produto é obrigatório" })
      .regex(/^\d+$/, { error: "O preço do produto deve ser um número" }),
    categoryId: z.string().min(1, { error: "O ID da categoria é obrigatório" }),
  }),
});
