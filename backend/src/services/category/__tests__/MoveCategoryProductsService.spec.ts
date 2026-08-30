import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { MoveCategoryProductsService } from "../MoveCategoryProductsService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  category: {
    findFirst: jest.fn(),
  },
  product: {
    updateMany: jest.fn(),
  },
}));

const findFirstMock = prismaClient.category.findFirst as jest.MockedFunction<
  typeof prismaClient.category.findFirst
>;
const updateManyMock = prismaClient.product.updateMany as jest.MockedFunction<
  typeof prismaClient.product.updateMany
>;

describe("MoveCategoryProductsService", () => {
  let service: MoveCategoryProductsService;

  beforeEach(() => {
    service = new MoveCategoryProductsService();
    jest.clearAllMocks();
  });

  it("deve mover os produtos e retornar a quantidade movida", async () => {
    findFirstMock
      .mockResolvedValueOnce({ id: "cat-origem" } as never)
      .mockResolvedValueOnce({ id: "cat-destino" } as never);
    updateManyMock.mockResolvedValue({ count: 3 } as never);

    const result = await service.execute({
      categoryId: "cat-origem",
      targetCategoryId: "cat-destino",
    });

    expect(result).toEqual({
      message: "Produtos movidos com sucesso",
      count: 3,
    });
  });

  it("deve chamar o prisma com os ids corretos", async () => {
    findFirstMock
      .mockResolvedValueOnce({ id: "cat-origem" } as never)
      .mockResolvedValueOnce({ id: "cat-destino" } as never);
    updateManyMock.mockResolvedValue({ count: 1 } as never);

    await service.execute({
      categoryId: "cat-origem",
      targetCategoryId: "cat-destino",
    });

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { categoryId: "cat-origem" },
      data: { categoryId: "cat-destino" },
    });
  });

  it("deve lançar AppError 400 se origem e destino forem iguais", async () => {
    await expect(
      service.execute({ categoryId: "cat-1", targetCategoryId: "cat-1" }),
    ).rejects.toEqual(
      new AppError(
        "A categoria de destino deve ser diferente da categoria de origem",
        400,
      ),
    );
    expect(findFirstMock).not.toHaveBeenCalled();
    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 404 se a categoria de origem não existir", async () => {
    findFirstMock
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce({ id: "cat-destino" } as never);

    await expect(
      service.execute({
        categoryId: "cat-inexistente",
        targetCategoryId: "cat-destino",
      }),
    ).rejects.toEqual(new AppError("Categoria de origem não encontrada", 404));
    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 404 se a categoria de destino não existir", async () => {
    findFirstMock
      .mockResolvedValueOnce({ id: "cat-origem" } as never)
      .mockResolvedValueOnce(null as never);

    await expect(
      service.execute({
        categoryId: "cat-origem",
        targetCategoryId: "cat-inexistente",
      }),
    ).rejects.toEqual(
      new AppError("Categoria de destino não encontrada", 404),
    );
    expect(updateManyMock).not.toHaveBeenCalled();
  });

  it("deve propagar erro inesperado do prisma", async () => {
    findFirstMock
      .mockResolvedValueOnce({ id: "cat-origem" } as never)
      .mockResolvedValueOnce({ id: "cat-destino" } as never);
    updateManyMock.mockRejectedValue(
      new Error("Erro de banco de dados") as never,
    );

    await expect(
      service.execute({
        categoryId: "cat-origem",
        targetCategoryId: "cat-destino",
      }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
