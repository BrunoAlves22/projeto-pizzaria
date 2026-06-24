import prismaClient from "../../prisma/index";

interface CreateCategoryServiceProps {
  name: string;
}

class CreateCategoryService {
  async execute({ name }: CreateCategoryServiceProps) {
    const category = await prismaClient.category.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return category;
  }
}

export { CreateCategoryService };
