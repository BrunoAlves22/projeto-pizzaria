import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ListOrderService } from "../ListOrderService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    findMany: jest.fn(),
  },
}));

const findManyMock = prismaClient.order.findMany as jest.MockedFunction<
  typeof prismaClient.order.findMany
>;

describe("ListOrderService", () => {
  let service: ListOrderService;

  beforeEach(() => {
    service = new ListOrderService();
    jest.clearAllMocks();
  });

  it("deve retornar a lista de pedidos", async () => {
    const fakeOrders = [
      {
        id: "order-id-1",
        table: 5,
        name: "João Silva",
        draft: true,
        status: false,
        createdAt: new Date(),
        orderItems: [],
      },
    ];
    findManyMock.mockResolvedValue(fakeOrders as never);

    const result = await service.execute({ draft: "true" });

    expect(result).toEqual(fakeOrders);
  });

  it("deve chamar o prisma filtrando draft: true quando draft='true'", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute({ draft: "true" });

    expect(findManyMock).toHaveBeenCalledWith({
      where: { draft: true },
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

  it("deve chamar o prisma filtrando draft: false quando draft='false'", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute({ draft: "false" });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { draft: false } }),
    );
  });

  it("deve filtrar draft: false quando o parâmetro não for informado", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute({ draft: undefined });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { draft: false } }),
    );
  });

  it("deve propagar erro inesperado do prisma", async () => {
    findManyMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute({ draft: "true" })).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
