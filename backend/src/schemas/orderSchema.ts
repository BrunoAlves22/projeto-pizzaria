import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    table: z
      .number({ error: "O número da mesa é obrigatório" })
      .int({ error: "O número da mesa deve ser um número inteiro" })
      .positive({ error: "O número da mesa deve ser positivo" }),
    name: z.string().min(1, { error: "O nome do cliente é obrigatório" }),
  }),
});

export const listOrderSchema = z.object({
  query: z.object({
    draft: z
      .enum(["true", "false"], { error: "Erro ao validar o parâmetro draft" })
      .optional(),
  }),
});

export const addItemOrderSchema = z.object({
  body: z.object({
    orderId: z.string({ error: "O ID do pedido é obrigatório" }),
    productId: z.string({ error: "O ID do produto é obrigatório" }),
    amount: z
      .number({ error: "A quantidade é obrigatória" })
      .int({ error: "A quantidade deve ser um número inteiro" })
      .positive({ error: "A quantidade deve ser positiva" }),
  }),
});
