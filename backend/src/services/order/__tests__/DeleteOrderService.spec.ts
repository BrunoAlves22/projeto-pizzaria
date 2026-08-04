import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteOrderService } from "../DeleteOrderService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

const findFirstMock = prismaClient.order.findFirst as jest.MockedFunction<
  typeof prismaClient.order.findFirst
>;
const deleteMock = prismaClient.order.delete as jest.MockedFunction<
  typeof prismaClient.order.delete
>;

describe("DeleteOrderService", () => {
  let service: DeleteOrderService;

  beforeEach(() => {
    service = new DeleteOrderService();
    jest.clearAllMocks();
  });

  it("deve deletar o pedido e retornar a mensagem de sucesso", async () => {
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({ orderId: "order-id-1" });

    expect(result).toEqual({ message: "Pedido deletado com sucesso" });
  });

  it("deve chamar o prisma buscando e deletando o pedido pelo id informado", async () => {
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    await service.execute({ orderId: "order-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
    });
  });

  it("deve lançar AppError 404 se o pedido não existir e não deve deletar", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ orderId: "order-inexistente" }),
    ).rejects.toEqual(new AppError("Pedido não encontrado", 404));

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a exclusão falhar", async () => {
    findFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    deleteMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ orderId: "order-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
