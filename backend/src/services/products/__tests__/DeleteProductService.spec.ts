import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteProductService } from "../DeleteProductService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  product: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

const findFirstMock = prismaClient.product.findFirst as jest.MockedFunction<
  typeof prismaClient.product.findFirst
>;
const deleteMock = prismaClient.product.delete as jest.MockedFunction<
  typeof prismaClient.product.delete
>;

describe("DeleteProductService", () => {
  let service: DeleteProductService;

  beforeEach(() => {
    service = new DeleteProductService();
    jest.clearAllMocks();
  });

  it("deve deletar o produto e retornar mensagem de sucesso", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({ product_id: "prod-id-1" });

    expect(result).toEqual({ message: "Produto deletado com sucesso" });
  });

  it("deve chamar o prisma com o id correto", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    deleteMock.mockResolvedValue({} as never);

    await service.execute({ product_id: "prod-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "prod-id-1" },
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "prod-id-1" },
    });
  });

  it("deve lançar AppError 404 se o produto não existir", async () => {
    findFirstMock.mockResolvedValue(null as never);

    await expect(
      service.execute({ product_id: "prod-inexistente" }),
    ).rejects.toEqual(new AppError("Produto não encontrado", 404));
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve propagar erro inesperado do prisma ao deletar", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    deleteMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ product_id: "prod-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
