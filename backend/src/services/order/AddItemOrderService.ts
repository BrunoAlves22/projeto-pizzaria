import { AppError } from "../../errors/AppError";
import prismaClient from "../../prisma/index";

interface AddItemOrderProps {
  orderId: string;
  productId: string;
  amount: number;
}

const itemSelect = {
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
} as const;

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

    // Se o mesmo produto já está no pedido, apenas soma a quantidade em vez de
    // criar outra linha para o mesmo produto.
    const existingItem = await prismaClient.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: productId,
      },
    });

    if (existingItem) {
      const item = await prismaClient.orderItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
        select: itemSelect,
      });

      return item;
    }

    const item = await prismaClient.orderItem.create({
      data: {
        orderId: orderId,
        productId: productId,
        amount: amount,
      },
      select: itemSelect,
    });

    return item;
  }
}

export { AddItemOrderService };
