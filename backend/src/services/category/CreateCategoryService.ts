import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface CreateCategoryServiceProps {
  name: string;
}

class CreateCategoryService {
  async execute({ name }: CreateCategoryServiceProps) {
    const categoryAlreadyExists = await prismaClient.category.findFirst({
      where: {
        name,
      },
    });

    if (categoryAlreadyExists) {
      throw new AppError("Categoria já existe", 409);
    }

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
