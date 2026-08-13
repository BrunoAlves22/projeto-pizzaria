import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { isAuthenticated } from "../isAuthenticated";
import { verify } from "jsonwebtoken";
import prismaClient from "../../prisma/index";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../prisma/index", () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

const verifyMock = verify as jest.MockedFunction<typeof verify>;
const findFirstMock = prismaClient.user.findFirst as jest.MockedFunction<
  typeof prismaClient.user.findFirst
>;

function buildRes() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis() as any,
    json: jest.fn().mockReturnThis() as any,
  };
  return res as Response;
}

describe("isAuthenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  it("deve retornar 401 se nenhum header authorization for enviado", async () => {
    const req = { headers: {} } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se o token estiver ausente após 'Bearer'", async () => {
    const req = { headers: { authorization: "Bearer" } } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se o token for inválido/expirado", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    const req = { headers: { authorization: "Bearer token123" } } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se o usuário não existir mais", async () => {
    verifyMock.mockReturnValue({ sub: "user-1", tokenVersion: 0 } as never);
    findFirstMock.mockResolvedValue(null);

    const req = { headers: { authorization: "Bearer token123" } } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se o tokenVersion do payload não bater com o do banco (sessão revogada)", async () => {
    verifyMock.mockReturnValue({ sub: "user-1", tokenVersion: 0 } as never);
    findFirstMock.mockResolvedValue({ tokenVersion: 1 } as never);

    const req = { headers: { authorization: "Bearer token123" } } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next e definir req.user_id quando o token e o tokenVersion forem válidos", async () => {
    verifyMock.mockReturnValue({ sub: "user-1", tokenVersion: 2 } as never);
    findFirstMock.mockResolvedValue({ tokenVersion: 2 } as never);

    const req = { headers: { authorization: "Bearer token123" } } as Request;
    const res = buildRes();
    const next = jest.fn();

    await isAuthenticated(req, res, next);

    expect(req.user_id).toBe("user-1");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
