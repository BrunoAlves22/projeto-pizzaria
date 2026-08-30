import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface DeleteCategoryProps {
  category_id: string;
}

class DeleteCategoryService {
  async execute({ category_id }: DeleteCategoryProps) {
    const categoryExists = await prismaClient.category.findFirst({
      where: {
        id: category_id,
      },
    });

    if (!categoryExists) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const productsCount = await prismaClient.product.count({
      where: {
        categoryId: category_id,
      },
    });

    if (productsCount > 0) {
      throw new AppError(
        "Não é possível excluir uma categoria que possui produtos vinculados",
        409,
      );
    }

    await prismaClient.category.delete({
      where: {
        id: category_id,
      },
    });

    return { message: "Categoria deletada com sucesso" };
  }
}

export { DeleteCategoryService };
