import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { RemoveItemOrderService } from "../RemoveItemOrderService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  orderItem: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

const findFirstMock = prismaClient.orderItem.findFirst as jest.MockedFunction<
  typeof prismaClient.orderItem.findFirst
>;
const deleteMock = prismaClient.orderItem.delete as jest.MockedFunction<
  typeof prismaClient.orderItem.delete
>;

describe("RemoveItemOrderService", () => {
  let service: RemoveItemOrderService;

  beforeEach(() => {
    service = new RemoveItemOrderService();
    jest.clearAllMocks();
  });

  it("deve deletar o item e retornar mensagem de sucesso", async () => {
    findFirstMock.mockResolvedValue({ id: "item-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({ itemId: "item-id-1" });

    expect(result).toEqual({ message: "Item deletado com sucesso" });
  });

  it("deve chamar o prisma buscando e deletando o item pelo id informado", async () => {
    findFirstMock.mockResolvedValue({ id: "item-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    await service.execute({ itemId: "item-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "item-id-1" },
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "item-id-1" },
    });
  });

  it("deve lançar AppError 404 se o item não existir e não deve deletar", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ itemId: "item-inexistente" }),
    ).rejects.toEqual(new AppError("Item não encontrado", 404));

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a exclusão falhar", async () => {
    findFirstMock.mockResolvedValue({ id: "item-id-1" } as never);
    deleteMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ itemId: "item-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
