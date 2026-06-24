import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CreateCategoryService } from "../CreateCategoryService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  category: {
    create: jest.fn(),
  },
}));

const createMock = prismaClient.category.create as jest.MockedFunction<
  typeof prismaClient.category.create
>;

describe("CreateCategoryService", () => {
  let service: CreateCategoryService;

  beforeEach(() => {
    service = new CreateCategoryService();
    jest.clearAllMocks();
  });

  it("deve criar uma categoria com sucesso e retornar id, name e createdAt", async () => {
    const fakeCategory = {
      id: "cat-id-1",
      name: "Pizzas",
      createdAt: new Date(),
    };

    createMock.mockResolvedValue(fakeCategory as never);

    const result = await service.execute({ name: "Pizzas" });

    expect(result).toEqual({
      id: "cat-id-1",
      name: "Pizzas",
      createdAt: expect.any(Date),
    });
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("deve chamar o prisma com o name correto e os campos selecionados", async () => {
    createMock.mockResolvedValue({ id: "cat-id-1", name: "Bebidas", createdAt: new Date() } as never);

    await service.execute({ name: "Bebidas" });

    expect(createMock).toHaveBeenCalledWith({
      data: { name: "Bebidas" },
      select: { id: true, name: true, createdAt: true },
    });
  });

  it("deve propagar o erro do prisma se a criação falhar", async () => {
    createMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute({ name: "Pizzas" })).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
