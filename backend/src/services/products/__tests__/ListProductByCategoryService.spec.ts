import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ListProductByCategoryService } from "../ListProductByCategoryService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  product: {
    findMany: jest.fn(),
  },
}));

const findManyMock = prismaClient.product.findMany as jest.MockedFunction<
  typeof prismaClient.product.findMany
>;

describe("ListProductByCategoryService", () => {
  let service: ListProductByCategoryService;

  beforeEach(() => {
    service = new ListProductByCategoryService();
    jest.clearAllMocks();
  });

  it("deve retornar lista de produtos da categoria", async () => {
    const fakeProducts = [
      {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        description: "Molho, mussarela e calabresa",
        price: 4500,
        banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
        disabled: false,
        categoryId: "cat-id-1",
        createdAt: new Date(),
      },
    ];

    findManyMock.mockResolvedValue(fakeProducts as never);

    const result = await service.execute({ category_id: "cat-id-1" });

    expect(result).toEqual(fakeProducts);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("deve chamar o prisma filtrando por categoryId e ordenando por name", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute({ category_id: "cat-id-1" });

    expect(findManyMock).toHaveBeenCalledWith({
      where: { categoryId: "cat-id-1" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        banner: true,
        disabled: true,
        categoryId: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  });

  it("deve retornar lista vazia quando a categoria não possui produtos", async () => {
    findManyMock.mockResolvedValue([] as never);

    const result = await service.execute({ category_id: "cat-inexistente" });

    expect(result).toEqual([]);
  });

  it("deve propagar o erro do prisma se a listagem falhar", async () => {
    findManyMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ category_id: "cat-id-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
