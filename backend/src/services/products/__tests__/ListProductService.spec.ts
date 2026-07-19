import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ListProductService } from "../ListProductService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  product: {
    findMany: jest.fn(),
  },
}));

const findManyMock = prismaClient.product.findMany as jest.MockedFunction<
  typeof prismaClient.product.findMany
>;

describe("ListProductService", () => {
  let service: ListProductService;

  beforeEach(() => {
    service = new ListProductService();
    jest.clearAllMocks();
  });

  it("deve retornar lista de produtos", async () => {
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

    const result = await service.execute({ disabled: false });

    expect(result).toEqual(fakeProducts);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("deve chamar o prisma filtrando por disabled e ordenando por name", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute({ disabled: true });

    expect(findManyMock).toHaveBeenCalledWith({
      where: { disabled: true },
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

  it("deve retornar lista vazia quando não há produtos", async () => {
    findManyMock.mockResolvedValue([] as never);

    const result = await service.execute({ disabled: false });

    expect(result).toEqual([]);
  });

  it("deve propagar o erro do prisma se a listagem falhar", async () => {
    findManyMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute({ disabled: false })).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
