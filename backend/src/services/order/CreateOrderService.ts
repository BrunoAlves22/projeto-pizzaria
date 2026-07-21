import prismaClient from "../../prisma/index";

interface CreateOrderServiceProps {
  table: number;
  name: string;
}

class CreateOrderService {
  async execute({ table, name }: CreateOrderServiceProps) {
    const order = await prismaClient.order.create({
      data: {
        table,
        name,
      },
      select: {
        id: true,
        table: true,
        name: true,
        status: true,
        draft: true,
        createdAt: true,
      },
    });

    return order;
  }
}

export { CreateOrderService };
