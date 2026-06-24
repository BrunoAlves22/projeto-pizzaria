import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { AuthUserController } from "../AuthUserController";
import { AuthUserService } from "../../../services/user/AuthUserService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/user/AuthUserService");

const app = express();
app.use(express.json());
app.post("/session", (req, res, next) => new AuthUserController().handle(req, res, next));
app.use(errorHandler);

const AuthUserServiceMock = AuthUserService as jest.MockedClass<
  typeof AuthUserService
>;

const fakeSession = {
  id: "user-id-123",
  name: "Bruno",
  email: "bruno@email.com",
  role: "STAFF",
  token: "fake_token",
};

describe("AuthUserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e os dados da sessão quando o login for bem-sucedido", async () => {
    AuthUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeSession as never) as any,
    }));

    const res = await request(app).post("/session").send({
      email: "bruno@email.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeSession);
  });

  it("deve retornar 401 quando as credenciais forem inválidas", async () => {
    AuthUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("E-mail ou senha incorretos", 401) as never,
        ) as any,
    }));

    const res = await request(app).post("/session").send({
      email: "bruno@email.com",
      password: "senha_errada",
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "E-mail ou senha incorretos" });
  });

  it("deve chamar o service com email e senha corretos", async () => {
    const executeMock = jest
      .fn()
      .mockResolvedValue(fakeSession as never) as any;

    AuthUserServiceMock.mockImplementation(() => ({ execute: executeMock }));

    await request(app).post("/session").send({
      email: "bruno@email.com",
      password: "123456",
    });

    expect(executeMock).toHaveBeenCalledWith({
      email: "bruno@email.com",
      password: "123456",
    });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    AuthUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).post("/session").send({
      email: "bruno@email.com",
      password: "123456",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
