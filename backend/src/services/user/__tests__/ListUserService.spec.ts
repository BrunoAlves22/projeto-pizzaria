import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ListUserService } from "../ListUserService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}));

const findManyMock = prismaClient.user.findMany as jest.MockedFunction<
  typeof prismaClient.user.findMany
>;

describe("ListUserService", () => {
  let service: ListUserService;

  beforeEach(() => {
    service = new ListUserService();
    jest.clearAllMocks();
  });

  it("deve retornar a lista de usuários", async () => {
    const fakeUsers = [
      {
        id: "user-1",
        name: "Bruno",
        email: "bruno@email.com",
        role: "ADMIN",
        createdAt: new Date(),
      },
      {
        id: "user-2",
        name: "Garçom",
        email: "garcom@email.com",
        role: "STAFF",
        createdAt: new Date(),
      },
    ];

    findManyMock.mockResolvedValue(fakeUsers as never);

    const result = await service.execute();

    expect(result).toEqual(fakeUsers);
    expect(findManyMock).toHaveBeenCalledTimes(1);
  });

  it("deve selecionar apenas campos não sensíveis e ordenar por createdAt desc", async () => {
    findManyMock.mockResolvedValue([] as never);

    await service.execute();

    expect(findManyMock).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("deve retornar lista vazia quando não há usuários", async () => {
    findManyMock.mockResolvedValue([] as never);

    const result = await service.execute();

    expect(result).toEqual([]);
  });

  it("deve propagar o erro do prisma se a listagem falhar", async () => {
    findManyMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute()).rejects.toThrow("Erro de banco de dados");
  });
});
