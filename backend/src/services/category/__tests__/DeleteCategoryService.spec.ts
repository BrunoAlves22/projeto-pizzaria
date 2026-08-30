import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteCategoryService } from "../DeleteCategoryService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  category: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    count: jest.fn(),
  },
}));

const findFirstMock = prismaClient.category.findFirst as jest.MockedFunction<
  typeof prismaClient.category.findFirst
>;
const deleteMock = prismaClient.category.delete as jest.MockedFunction<
  typeof prismaClient.category.delete
>;
const countMock = prismaClient.product.count as jest.MockedFunction<
  typeof prismaClient.product.count
>;

describe("DeleteCategoryService", () => {
  let service: DeleteCategoryService;

  beforeEach(() => {
    service = new DeleteCategoryService();
    jest.clearAllMocks();
  });

  it("deve deletar a categoria e retornar mensagem de sucesso quando não houver produtos vinculados", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    countMock.mockResolvedValue(0 as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({ category_id: "cat-id-1" });

    expect(result).toEqual({ message: "Categoria deletada com sucesso" });
  });

  it("deve chamar o prisma com o id correto", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    countMock.mockResolvedValue(0 as never);
    deleteMock.mockResolvedValue({} as never);

    await service.execute({ category_id: "cat-id-1" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "cat-id-1" },
    });
    expect(countMock).toHaveBeenCalledWith({
      where: { categoryId: "cat-id-1" },
    });
    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "cat-id-1" },
    });
  });

  it("deve lançar AppError 404 se a categoria não existir", async () => {
    findFirstMock.mockResolvedValue(null as never);

    await expect(
      service.execute({ category_id: "cat-inexistente" }),
    ).rejects.toEqual(new AppError("Categoria não encontrada", 404));
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 409 se a categoria tiver produtos vinculados", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    countMock.mockResolvedValue(2 as never);

    await expect(
      service.execute({ category_id: "cat-id-1" }),
    ).rejects.toEqual(
      new AppError(
        "Não é possível excluir uma categoria que possui produtos vinculados",
        409,
      ),
    );
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve propagar erro inesperado do prisma ao deletar", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    countMock.mockResolvedValue(0 as never);
    deleteMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ category_id: "cat-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
