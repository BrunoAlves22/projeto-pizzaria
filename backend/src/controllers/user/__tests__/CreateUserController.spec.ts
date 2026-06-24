import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express, { NextFunction, Request, Response } from "express";
import { CreateUserController } from "../CreateUserController";
import { CreateUserService } from "../../../services/user/CreateUserService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/user/CreateUserService");

const app = express();
app.use(express.json());
app.post("/users", (req, res, next) => new CreateUserController().handle(req, res, next));
app.use(errorHandler);

const CreateUserServiceMock = CreateUserService as jest.MockedClass<
  typeof CreateUserService
>;

describe("CreateUserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e os dados do usuário criado", async () => {
    const fakeUser = {
      id: "1",
      name: "Bruno",
      email: "bruno@email.com",
      role: "STAFF",
      createdAt: new Date().toISOString(),
    };

    CreateUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeUser as never) as any,
    }));

    const res = await request(app).post("/users").send({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeUser);
  });

  it("deve retornar 409 se o usuário já existir", async () => {
    CreateUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new AppError("Usuário já existe", 409) as never) as any,
    }));

    const res = await request(app).post("/users").send({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: "Usuário já existe" });
  });

  it("deve chamar o service com os dados corretos", async () => {
    const executeMock = jest.fn().mockResolvedValue("Bruno" as never) as any;

    CreateUserServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).post("/users").send({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(executeMock).toHaveBeenCalledWith({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });
  });

  it("deve retornar 500 em caso de erro inesperado", async () => {
    CreateUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).post("/users").send({
      name: "Bruno",
      email: "bruno@email.com",
      password: "123456",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
