import prismaClient from "../../prisma/index";

class ListCategoryService {
  async execute() {
    const categories = await prismaClient.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  }
}

export { ListCategoryService };
