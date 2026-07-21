import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CreateOrderService } from "../CreateOrderService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    create: jest.fn(),
  },
}));

const createMock = prismaClient.order.create as jest.MockedFunction<
  typeof prismaClient.order.create
>;

describe("CreateOrderService", () => {
  let service: CreateOrderService;

  beforeEach(() => {
    service = new CreateOrderService();
    jest.clearAllMocks();
  });

  it("deve criar um pedido e retorná-lo", async () => {
    const fakeOrder = {
      id: "order-id-1",
      table: 5,
      name: "João Silva",
      status: false,
      draft: true,
      createdAt: new Date(),
    };
    createMock.mockResolvedValue(fakeOrder as never);

    const result = await service.execute({ table: 5, name: "João Silva" });

    expect(result).toEqual(fakeOrder);
  });

  it("deve chamar o prisma com os dados corretos", async () => {
    createMock.mockResolvedValue({} as never);

    await service.execute({ table: 5, name: "João Silva" });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        table: 5,
        name: "João Silva",
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
  });

  it("deve propagar erro inesperado do prisma", async () => {
    createMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ table: 5, name: "João Silva" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
