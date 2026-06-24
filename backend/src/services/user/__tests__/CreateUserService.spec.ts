import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CreateUserService } from "../CreateUserService";
import prismaClient from "../../../prisma";
import { hash } from "bcryptjs";

jest.mock("../../../prisma", () => ({
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// 👇 Tipando cada mock explicitamente
const findFirstMock = prismaClient.user.findFirst as jest.MockedFunction<
  typeof prismaClient.user.findFirst
>;
const createMock = prismaClient.user.create as jest.MockedFunction<
  typeof prismaClient.user.create
>;
const hashMock = hash as jest.MockedFunction<typeof hash>;

describe("CreateUserService", () => {
  let service: CreateUserService;

  beforeEach(() => {
    service = new CreateUserService();
    jest.clearAllMocks();
  });

  it("deve criar um usuário com sucesso e retornar os dados do usuário", async () => {
    findFirstMock.mockResolvedValue(null);
    hashMock.mockResolvedValue("hashed_password" as never);
    createMock.mockResolvedValue({
      id: "1",
      name: "Bruno",
      email: "bruno@email.com",
      role: "STAFF",
      createdAt: new Date(),
    } as never);

    const result = await service.execute({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(result).toEqual({
      id: "1",
      name: "Bruno",
      email: "bruno@email.com",
      role: "STAFF",
      createdAt: expect.any(Date),
    });
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("deve lançar erro se usuário já existir", async () => {
    findFirstMock.mockResolvedValue({
      id: "1",
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
      role: "STAFF",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.execute({
        name: "Bruno",
        email: "bruno@email.com",
        password: "123456",
      }),
    ).rejects.toThrow("Usuário já existe");

    expect(createMock).not.toHaveBeenCalled();
  });

  it("deve chamar o hash com a senha e custo 8", async () => {
    findFirstMock.mockResolvedValue(null);
    hashMock.mockResolvedValue("hashed_password" as never);
    createMock.mockResolvedValue({ name: "Bruno" } as never);

    await service.execute({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(hashMock).toHaveBeenCalledWith("123456", 8);
  });
});
