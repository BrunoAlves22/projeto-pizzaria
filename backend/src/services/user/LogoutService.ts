import prismaClient from "../../prisma";

interface LogoutServiceProps {
  id: string;
}

class LogoutService {
  async execute({ id }: LogoutServiceProps) {
    await prismaClient.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });

    return { message: "Sessões encerradas com sucesso" };
  }
}

export { LogoutService };
