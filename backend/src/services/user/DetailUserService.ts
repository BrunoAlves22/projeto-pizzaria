import prismaClient from "../../prisma";

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
      throw new Error("Usuário não encontrado");
    }
    return user;
  }
}

export { DetailUserService };
