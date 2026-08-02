import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface DetailOrderServiceProps {
  orderId: string;
}

class DetailOrderService {
  async execute({ orderId }: DetailOrderServiceProps) {
    const order = await prismaClient.order.findFirst({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        table: true,
        name: true,
        draft: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            id: true,
            amount: true,
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                banner: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    return order;
  }
}

export { DetailOrderService };
