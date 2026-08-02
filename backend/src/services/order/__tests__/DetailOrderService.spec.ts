import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DetailOrderService } from "../DetailOrderService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    findFirst: jest.fn(),
  },
}));

const findFirstMock = prismaClient.order.findFirst as jest.MockedFunction<
  typeof prismaClient.order.findFirst
>;

describe("DetailOrderService", () => {
  let service: DetailOrderService;

  beforeEach(() => {
    service = new DetailOrderService();
    jest.clearAllMocks();
  });

  it("deve retornar os detalhes do pedido com os itens e produtos", async () => {
    const fakeOrder = {
      id: "order-id-1",
      table: 5,
      name: "João Silva",
      draft: true,
      status: false,
      createdAt: new Date(),
      orderItems: [
        {
          id: "item-id-1",
          amount: 2,
          product: {
            id: "prod-id-1",
            name: "Pizza Calabresa",
            description: "Molho, mussarela e calabresa",
            price: 4500,
            banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
          },
        },
      ],
    };
    findFirstMock.mockResolvedValue(fakeOrder as never);

    const result = await service.execute({ orderId: "order-id-1" });

    expect(result).toEqual(fakeOrder);
  });

  it("deve chamar o prisma filtrando pelo id do pedido e com os campos selecionados", async () => {
    findFirstMock.mockResolvedValue({} as never);

    await service.execute({ orderId: "order-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
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
  });

  it("deve lançar AppError 404 se o pedido não existir", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ orderId: "order-inexistente" }),
    ).rejects.toEqual(new AppError("Pedido não encontrado", 404));
  });

  it("deve propagar o erro do prisma se a busca falhar", async () => {
    findFirstMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ orderId: "order-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
