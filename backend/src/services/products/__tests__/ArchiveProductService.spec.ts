import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ArchiveProductService } from "../ArchiveProductService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  product: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

const findFirstMock = prismaClient.product.findFirst as jest.MockedFunction<
  typeof prismaClient.product.findFirst
>;
const updateMock = prismaClient.product.update as jest.MockedFunction<
  typeof prismaClient.product.update
>;

describe("ArchiveProductService", () => {
  let service: ArchiveProductService;

  beforeEach(() => {
    service = new ArchiveProductService();
    jest.clearAllMocks();
  });

  it("deve arquivar o produto e retornar mensagem de sucesso", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    updateMock.mockResolvedValue({} as never);

    const result = await service.execute({ product_id: "prod-id-1" });

    expect(result).toEqual({ message: "Produto arquivado com sucesso" });
  });

  it("deve chamar o prisma com o id correto e disabled: true", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    updateMock.mockResolvedValue({} as never);

    await service.execute({ product_id: "prod-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "prod-id-1" },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "prod-id-1" },
      data: { disabled: true },
    });
  });

  it("deve lançar AppError 404 se o produto não existir", async () => {
    findFirstMock.mockResolvedValue(null as never);

    await expect(
      service.execute({ product_id: "prod-inexistente" }),
    ).rejects.toEqual(new AppError("Produto não encontrado", 404));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deve propagar erro inesperado do prisma ao atualizar", async () => {
    findFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    updateMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ product_id: "prod-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
