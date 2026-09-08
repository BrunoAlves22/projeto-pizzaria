import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DeleteUserService } from "../DeleteUserService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  user: {
    findFirst: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
}));

const findFirstMock = prismaClient.user.findFirst as jest.MockedFunction<
  typeof prismaClient.user.findFirst
>;
const countMock = prismaClient.user.count as jest.MockedFunction<
  typeof prismaClient.user.count
>;
const deleteMock = prismaClient.user.delete as jest.MockedFunction<
  typeof prismaClient.user.delete
>;

describe("DeleteUserService", () => {
  let service: DeleteUserService;

  beforeEach(() => {
    service = new DeleteUserService();
    jest.clearAllMocks();
  });

  it("deve excluir um usuário STAFF e retornar a mensagem de sucesso", async () => {
    findFirstMock.mockResolvedValue({ id: "user-2", role: "STAFF" } as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({
      userId: "user-2",
      requesterId: "admin-1",
    });

    expect(result).toEqual({ message: "Usuário excluído com sucesso" });
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: "user-2" } });
    expect(countMock).not.toHaveBeenCalled();
  });

  it("deve lançar 400 ao tentar excluir a própria conta", async () => {
    await expect(
      service.execute({ userId: "admin-1", requesterId: "admin-1" }),
    ).rejects.toMatchObject({
      message: "Você não pode excluir a própria conta",
      statusCode: 400,
    });

    expect(findFirstMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve lançar 404 se o usuário não existir", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(
      service.execute({ userId: "inexistente", requesterId: "admin-1" }),
    ).rejects.toMatchObject({
      message: "Usuário não encontrado",
      statusCode: 404,
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve lançar 409 ao excluir um ADMIN quando ele é o único", async () => {
    findFirstMock.mockResolvedValue({ id: "admin-2", role: "ADMIN" } as never);
    countMock.mockResolvedValue(1 as never);

    await expect(
      service.execute({ userId: "admin-2", requesterId: "admin-1" }),
    ).rejects.toMatchObject({
      message: "Não é possível excluir o último administrador",
      statusCode: 409,
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deve excluir um ADMIN quando existem outros administradores", async () => {
    findFirstMock.mockResolvedValue({ id: "admin-2", role: "ADMIN" } as never);
    countMock.mockResolvedValue(2 as never);
    deleteMock.mockResolvedValue({} as never);

    const result = await service.execute({
      userId: "admin-2",
      requesterId: "admin-1",
    });

    expect(result).toEqual({ message: "Usuário excluído com sucesso" });
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: "admin-2" } });
  });

  it("deve propagar erro inesperado do prisma", async () => {
    findFirstMock.mockResolvedValue({ id: "user-2", role: "STAFF" } as never);
    deleteMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(
      service.execute({ userId: "user-2", requesterId: "admin-1" }),
    ).rejects.toThrow("Erro de banco de dados");
  });
});
