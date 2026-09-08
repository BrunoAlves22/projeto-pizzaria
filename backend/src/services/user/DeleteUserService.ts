import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface DeleteUserProps {
  /** Usuário a ser excluído. */
  userId: string;
  /** Usuário autenticado que está pedindo a exclusão (do `req.user_id`). */
  requesterId: string;
}

class DeleteUserService {
  async execute({ userId, requesterId }: DeleteUserProps) {
    if (userId === requesterId) {
      throw new AppError("Você não pode excluir a própria conta", 400);
    }

    const user = await prismaClient.user.findFirst({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Nunca deixar o sistema sem nenhum administrador.
    if (user.role === "ADMIN") {
      const adminCount = await prismaClient.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        throw new AppError(
          "Não é possível excluir o último administrador",
          409,
        );
      }
    }

    await prismaClient.user.delete({ where: { id: userId } });

    // O JWT do usuário excluído deixa de valer na próxima requisição:
    // `isAuthenticated` faz `findFirst` pelo id e responde 401 se não achar.
    return { message: "Usuário excluído com sucesso" };
  }
}

export { DeleteUserService };
