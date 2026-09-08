import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ListUserController } from "../ListUserController";
import { ListUserService } from "../../../services/user/ListUserService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/user/ListUserService");

const app = express();
app.use(express.json());
app.get("/users", (req, res, next) =>
  new ListUserController().handle(req, res, next),
);
app.use(errorHandler);

const ListUserServiceMock = ListUserService as jest.MockedClass<
  typeof ListUserService
>;

describe("ListUserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a lista de usuários", async () => {
    const fakeUsers = [
      {
        id: "user-1",
        name: "Bruno",
        email: "bruno@email.com",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-2",
        name: "Garçom",
        email: "garcom@email.com",
        role: "STAFF",
        createdAt: new Date().toISOString(),
      },
    ];

    ListUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeUsers as never) as any,
    }));

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUsers);
  });

  it("deve retornar 200 e lista vazia quando não há usuários", async () => {
    ListUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([] as never) as any,
    }));

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("deve retornar 500 em caso de erro inesperado do banco", async () => {
    ListUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/users");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
