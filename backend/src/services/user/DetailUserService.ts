import prismaClient from "../../prisma";
import { AppError } from "../../errors/AppError";

interface DetailUserServiceProps {
  id: string;
}

class DetailUserService {
  async execute({ id }: DetailUserServiceProps) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return user;
  }
}

export { DetailUserService };
