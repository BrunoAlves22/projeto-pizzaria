import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { LogoutService } from "../LogoutService";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  user: {
    update: jest.fn(),
  },
}));

const updateMock = prismaClient.user.update as jest.MockedFunction<
  typeof prismaClient.user.update
>;

describe("LogoutService", () => {
  let service: LogoutService;

  beforeEach(() => {
    service = new LogoutService();
    jest.clearAllMocks();
  });

  it("deve incrementar o tokenVersion do usuário e retornar mensagem de sucesso", async () => {
    updateMock.mockResolvedValue({} as never);

    const result = await service.execute({ id: "user-id-123" });

    expect(result).toEqual({ message: "Sessões encerradas com sucesso" });
  });

  it("deve chamar o prisma com o id correto e incremento do tokenVersion", async () => {
    updateMock.mockResolvedValue({} as never);

    await service.execute({ id: "user-id-123" });

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "user-id-123" },
      data: { tokenVersion: { increment: 1 } },
    });
  });

  it("deve propagar erro inesperado do prisma", async () => {
    updateMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute({ id: "user-id-123" })).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
