import { z } from "zod";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: "O nome da categoria é obrigatório" }),
  }),
});

const deleteCategorySchema = z.object({
  query: z.object({
    category_id: z
      .string()
      .min(1, { error: "O ID da categoria é obrigatório" }),
  }),
});

const moveCategoryProductsSchema = z.object({
  body: z.object({
    categoryId: z
      .string()
      .min(1, { error: "O ID da categoria de origem é obrigatório" }),
    targetCategoryId: z
      .string()
      .min(1, { error: "O ID da categoria de destino é obrigatório" }),
  }),
});

export { createCategorySchema, deleteCategorySchema, moveCategoryProductsSchema };
