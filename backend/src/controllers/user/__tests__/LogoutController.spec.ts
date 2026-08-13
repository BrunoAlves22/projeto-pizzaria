import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { LogoutController } from "../LogoutController";
import { LogoutService } from "../../../services/user/LogoutService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/user/LogoutService");

const app = express();
app.use(express.json());
app.post("/logout", (req: any, res, next) => {
  req.user_id = "user-id-123";
  return new LogoutController().handle(req, res, next);
});
app.use(errorHandler);

const LogoutServiceMock = LogoutService as jest.MockedClass<
  typeof LogoutService
>;

describe("LogoutController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    LogoutServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockResolvedValue({ message: "Sessões encerradas com sucesso" } as never) as any,
    }));

    const res = await request(app).post("/logout");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Sessões encerradas com sucesso" });
  });

  it("deve chamar o service com o id correto vindo do req.user_id", async () => {
    const executeMock = jest
      .fn()
      .mockResolvedValue({ message: "ok" } as never) as any;

    LogoutServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).post("/logout");

    expect(executeMock).toHaveBeenCalledWith({ id: "user-id-123" });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    LogoutServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).post("/logout");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
