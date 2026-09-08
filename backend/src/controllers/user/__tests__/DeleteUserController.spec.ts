import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DeleteUserController } from "../DeleteUserController";
import { DeleteUserService } from "../../../services/user/DeleteUserService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/user/DeleteUserService");

const app = express();
app.use(express.json());
app.delete("/users", (req: any, res, next) => {
  req.user_id = "admin-1";
  return new DeleteUserController().handle(req, res, next);
});
app.use(errorHandler);

const DeleteUserServiceMock = DeleteUserService as jest.MockedClass<
  typeof DeleteUserService
>;

describe("DeleteUserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const fakeResponse = { message: "Usuário excluído com sucesso" };
    DeleteUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeResponse as never) as any,
    }));

    const res = await request(app).delete("/users?user_id=user-2");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResponse);
  });

  it("deve chamar o service com o user_id da query e o requesterId do req.user_id", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;
    DeleteUserServiceMock.mockImplementation(() => ({ execute: executeMock }));

    await request(app).delete("/users?user_id=user-2");

    expect(executeMock).toHaveBeenCalledWith({
      userId: "user-2",
      requesterId: "admin-1",
    });
  });

  it("deve retornar 400 ao tentar excluir a própria conta", async () => {
    DeleteUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Você não pode excluir a própria conta", 400) as never,
        ) as any,
    }));

    const res = await request(app).delete("/users?user_id=admin-1");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Você não pode excluir a própria conta",
    });
  });

  it("deve retornar 404 se o usuário não existir", async () => {
    DeleteUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Usuário não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).delete("/users?user_id=inexistente");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Usuário não encontrado" });
  });

  it("deve retornar 409 ao excluir o último administrador", async () => {
    DeleteUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError(
            "Não é possível excluir o último administrador",
            409,
          ) as never,
        ) as any,
    }));

    const res = await request(app).delete("/users?user_id=admin-2");

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      message: "Não é possível excluir o último administrador",
    });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    DeleteUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).delete("/users?user_id=user-2");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
