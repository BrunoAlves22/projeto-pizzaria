import prismaClient from "../../prisma/index";
import { AppError } from "../../errors/AppError";

interface SendOrderProps {
  name: string;
  orderId: string;
}

class SendOrderService {
  async execute({ name, orderId }: SendOrderProps) {
    const orderExists = await prismaClient.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const orderSent = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: {
        draft: false,
        name: name,
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

    return orderSent;
  }
}

export { SendOrderService };
