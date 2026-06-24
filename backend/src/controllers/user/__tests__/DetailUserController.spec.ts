import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DetailUserController } from "../DetailUserController";
import { DetailUserService } from "../../../services/user/DetailUserService";

jest.mock("../../../services/user/DetailUserService");

const app = express();
app.use(express.json());
app.get("/me", (req: any, res) => {
  req.user_id = "user-id-123";
  return new DetailUserController().handle(req, res);
});

const DetailUserServiceMock = DetailUserService as jest.MockedClass<
  typeof DetailUserService
>;

const fakeUser = {
  id: "user-id-123",
  name: "Bruno",
  email: "bruno@email.com",
  createdAt: new Date().toISOString(),
};

describe("DetailUserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e os dados do usuário quando encontrado", async () => {
    DetailUserServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeUser as never) as any,
    }));

    const res = await request(app).get("/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeUser);
  });

  it("deve retornar 404 quando o usuário não for encontrado", async () => {
    DetailUserServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Usuário não encontrado") as never) as any,
    }));

    const res = await request(app).get("/me");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Usuário não encontrado" });
  });

  it("deve chamar o service com o id correto vindo do req.user_id", async () => {
    const executeMock = jest.fn().mockResolvedValue(fakeUser as never) as any;

    DetailUserServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/me");

    expect(executeMock).toHaveBeenCalledWith({ id: "user-id-123" });
  });
});
