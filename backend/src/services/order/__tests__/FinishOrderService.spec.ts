import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { FinishOrderService } from "../FinishOrderService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

const findFirstMock = prismaClient.order.findFirst as jest.MockedFunction<
  typeof prismaClient.order.findFirst
>;
const updateMock = prismaClient.order.update as jest.MockedFunction<
  typeof prismaClient.order.update
>;

describe("FinishOrderService", () => {
  let service: FinishOrderService;

  beforeEach(() => {
    service = new FinishOrderService();
    jest.clearAllMocks();
  });

  it("deve finalizar o pedido e retornar os dados atualizados", async () => {
    const fakeOrder = {
      id: "order-id-1",
      name: "João Silva",
      draft: false,
      table: 5,
      status: true,
      createdAt: new Date(),
    };
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    updateMock.mockResolvedValue(fakeOrder as never);

    const result = await service.execute({ orderId: "order-id-1" });

    expect(result).toEqual(fakeOrder);
  });

  it("deve chamar o prisma atualizando o pedido pelo id informado com status true", async () => {
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    updateMock.mockResolvedValue({} as never);

    await service.execute({ orderId: "order-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
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
  });

  it("deve lançar AppError 404 se o pedido não existir e não deve atualizar", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ orderId: "order-inexistente" }),
    ).rejects.toEqual(new AppError("Pedido não encontrado", 404));

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a atualização falhar", async () => {
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    updateMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ orderId: "order-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
