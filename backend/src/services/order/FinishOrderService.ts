import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface FinishOrderProps {
  orderId: string;
}

class FinishOrderService {
  async execute({ orderId }: FinishOrderProps) {
    const orderExists = await prismaClient.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const orderFinished = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: true,
      },
      select: {
        id: true,
        name: true,
        draft: true,
        table: true,
        status: true,
        createdAt: true,
      },
    });

    return orderFinished;
  }
}

export { FinishOrderService };
