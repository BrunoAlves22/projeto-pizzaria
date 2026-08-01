import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface AddItemOrderProps {
  orderId: string;
  productId: string;
  amount: number;
}

class AddItemOrderService {
  async execute({ orderId, productId, amount }: AddItemOrderProps) {
    const orderExists = await prismaClient.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const productExists = await prismaClient.product.findFirst({
      where: {
        id: productId,
        disabled: false,
      },
    });

    if (!productExists) {
      throw new AppError("Produto não encontrado", 404);
    }

    const item = await prismaClient.orderItem.create({
      data: {
        orderId: orderId,
        productId: productId,
        amount: amount,
      },
      select: {
        id: true,
        amount: true,
        orderId: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            banner: true,
          },
        },
      },
    });

    return item;
  }
}

export { AddItemOrderService };
