import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface ListProductByCategoryDTO {
  category_id: string;
}

class ListProductByCategoryService {
  async execute({ category_id }: ListProductByCategoryDTO) {
    const categoryExists = await prismaClient.category.findFirst({
      where: {
        id: category_id,
      },
    });

    if (!categoryExists) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const products = await prismaClient.product.findMany({
      where: {
        categoryId: category_id,
        disabled: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        banner: true,
        disabled: true,
        categoryId: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  }
}

export { ListProductByCategoryService };
