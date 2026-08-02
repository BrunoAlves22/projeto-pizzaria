import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface RemoveItemOrderProps {
  itemId: string;
}

class RemoveItemOrderService {
  async execute({ itemId }: RemoveItemOrderProps) {
    const itemExists = await prismaClient.orderItem.findFirst({
      where: {
        id: itemId,
      },
    });

    if (!itemExists) {
      throw new AppError("Item não encontrado", 404);
    }

    await prismaClient.orderItem.delete({
      where: {
        id: itemId,
      },
    });

    return { message: "Item deletado com sucesso" };
  }
}

export { RemoveItemOrderService };
