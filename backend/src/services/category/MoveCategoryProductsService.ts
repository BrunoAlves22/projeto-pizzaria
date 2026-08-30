import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface MoveCategoryProductsProps {
  categoryId: string;
  targetCategoryId: string;
}

class MoveCategoryProductsService {
  async execute({ categoryId, targetCategoryId }: MoveCategoryProductsProps) {
    if (categoryId === targetCategoryId) {
      throw new AppError(
        "A categoria de destino deve ser diferente da categoria de origem",
        400,
      );
    }

    const [categoryExists, targetCategoryExists] = await Promise.all([
      prismaClient.category.findFirst({ where: { id: categoryId } }),
      prismaClient.category.findFirst({ where: { id: targetCategoryId } }),
    ]);

    if (!categoryExists) {
      throw new AppError("Categoria de origem não encontrada", 404);
    }

    if (!targetCategoryExists) {
      throw new AppError("Categoria de destino não encontrada", 404);
    }

    const result = await prismaClient.product.updateMany({
      where: { categoryId },
      data: { categoryId: targetCategoryId },
    });

    return {
      message: "Produtos movidos com sucesso",
      count: result.count,
    };
  }
}

export { MoveCategoryProductsService };
