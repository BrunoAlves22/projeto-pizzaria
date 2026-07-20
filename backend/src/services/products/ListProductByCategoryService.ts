import prismaClient from "../../prisma/index";

interface ListProductByCategoryDTO {
  category_id: string;
}

class ListProductByCategoryService {
  async execute({ category_id }: ListProductByCategoryDTO) {
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
