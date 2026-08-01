import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CreateCategoryService } from "../CreateCategoryService";
import prismaClient from "../../../prisma";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../prisma", () => ({
  category: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}));

const findFirstMock = prismaClient.category.findFirst as jest.MockedFunction<
  typeof prismaClient.category.findFirst
>;
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
    findFirstMock.mockResolvedValue(null);

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
    findFirstMock.mockResolvedValue(null);
    createMock.mockResolvedValue({ id: "cat-id-1", name: "Bebidas", createdAt: new Date() } as never);

    await service.execute({ name: "Bebidas" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { name: "Bebidas" },
    });
    expect(createMock).toHaveBeenCalledWith({
      data: { name: "Bebidas" },
      select: { id: true, name: true, createdAt: true },
    });
  });

  it("deve lançar AppError 409 se a categoria já existir e não deve criar", async () => {
    findFirstMock.mockResolvedValue({
      id: "cat-id-1",
      name: "Pizzas",
      createdAt: new Date(),
    } as never);

    await expect(service.execute({ name: "Pizzas" })).rejects.toThrow(
      new AppError("Categoria já existe", 409),
    );

    expect(createMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a criação falhar", async () => {
    findFirstMock.mockResolvedValue(null);
    createMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute({ name: "Pizzas" })).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
