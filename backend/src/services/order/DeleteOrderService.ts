import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface DeleteOrderProps {
  orderId: string;
}

class DeleteOrderService {
  async execute({ orderId }: DeleteOrderProps) {
    const orderExists = await prismaClient.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      throw new AppError("Pedido não encontrado", 404);
    }

    await prismaClient.order.delete({
      where: {
        id: orderId,
      },
    });

    return { message: "Pedido deletado com sucesso" };
  }
}

export { DeleteOrderService };
