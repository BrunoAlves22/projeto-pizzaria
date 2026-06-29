import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ListCategoryService } from "../ListCategoryService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  category: {
    findMany: jest.fn(),
  },
}));

const findManyMock = prismaClient.category.findMany as jest.MockedFunction<
  typeof prismaClient.category.findMany
>;

describe("ListCategoryService", () => {
  let service: ListCategoryService;

  beforeEach(() => {
    service = new ListCategoryService();
    jest.clearAllMocks();
  });

  it("deve retornar lista de categorias", async () => {
    const fakeCategories = [
      { id: "cat-id-1", name: "Bebidas", createdAt: new Date() },
      { id: "cat-id-2", name: "Pizzas", createdAt: new Date() },
    ];

    findManyMock.mockResolvedValue(fakeCategories as never);

    const result = await service.execute();

    expect(result).toEqual(fakeCategories);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("deve chamar o prisma com os campos selecionados e ordenação por name", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute();

    expect(findManyMock).toHaveBeenCalledWith({
      select: { id: true, name: true, createdAt: true },
      orderBy: { name: "asc" },
    });
  });

  it("deve retornar lista vazia quando não há categorias", async () => {
    findManyMock.mockResolvedValue([] as never);

    const result = await service.execute();

    expect(result).toEqual([]);
  });

  it("deve propagar o erro do prisma se a listagem falhar", async () => {
    findManyMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute()).rejects.toThrow("Erro de banco de dados");
  });
});
