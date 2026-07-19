import prismaClient from "../../prisma/index";

interface ListProductDTO {
  disabled: boolean;
}

class ListProductService {
  async execute({ disabled }: ListProductDTO) {
    const products = await prismaClient.product.findMany({
      where: {
        disabled,
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

export { ListProductService };
