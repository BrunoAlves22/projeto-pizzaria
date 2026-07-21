import prismaClient from "../../prisma/index";

interface ListOrderDTO {
  draft?: string;
}

class ListOrderService {
  async execute({ draft }: ListOrderDTO) {
    const orders = await prismaClient.order.findMany({
      where: {
        draft: draft === "true" ? true : false,
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
    return orders;
  }
}

export { ListOrderService };
