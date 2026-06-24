import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DetailUserService } from "../DetailUserService";
import prismaClient from "../../prisma";

jest.mock("../../prisma", () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

const findFirstMock = prismaClient.user.findFirst as jest.MockedFunction<
  typeof prismaClient.user.findFirst
>;

const fakeUser = {
  id: "user-id-123",
  name: "Bruno",
  email: "bruno@email.com",
  createdAt: new Date(),
};

describe("DetailUserService", () => {
  let service: DetailUserService;

  beforeEach(() => {
    service = new DetailUserService();
    jest.clearAllMocks();
  });

  it("deve retornar os dados do usuário quando encontrado", async () => {
    findFirstMock.mockResolvedValue(fakeUser as never);

    const result = await service.execute({ id: "user-id-123" });

    expect(result).toEqual(fakeUser);
  });

  it("deve lançar erro se o usuário não for encontrado", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ id: "id-inexistente" }),
    ).rejects.toThrow("Usuário não encontrado");
  });

  it("deve chamar findFirst com o id correto", async () => {
    findFirstMock.mockResolvedValue(fakeUser as never);

    await service.execute({ id: "user-id-123" });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "user-id-123" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  });

  it("deve chamar findFirst exatamente uma vez", async () => {
    findFirstMock.mockResolvedValue(fakeUser as never);

    await service.execute({ id: "user-id-123" });

    expect(findFirstMock).toHaveBeenCalledTimes(1);
  });
});
