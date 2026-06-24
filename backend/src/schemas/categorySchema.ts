import { z } from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "O nome da categoria é obrigatório" }),
  }),
});

export { createCategorySchema };
