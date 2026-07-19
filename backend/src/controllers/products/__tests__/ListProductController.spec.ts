import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ListProductController } from "../ListProductController";
import { ListProductService } from "../../../services/products/ListProductService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/products/ListProductService");

const app = express();
app.use(express.json());
app.get("/products", (req, res, next) =>
  new ListProductController().handle(req, res, next),
);
app.use(errorHandler);

const ListProductServiceMock = ListProductService as jest.MockedClass<
  typeof ListProductService
>;

describe("ListProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a lista de produtos filtrando disabled=false por padrão", async () => {
    const fakeProducts = [
      {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        disabled: false,
        createdAt: new Date().toISOString(),
      },
    ];
    const executeMock = jest.fn().mockResolvedValue(fakeProducts as never) as any;

    ListProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProducts);
    expect(executeMock).toHaveBeenCalledWith({ disabled: false });
  });

  it("deve chamar o service com disabled=true quando disabled=true for enviado", async () => {
    const executeMock = jest.fn().mockResolvedValue([] as never) as any;

    ListProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/products?disabled=true");

    expect(executeMock).toHaveBeenCalledWith({ disabled: true });
  });

  it("deve chamar o service com disabled=false quando disabled=false for enviado explicitamente", async () => {
    const executeMock = jest.fn().mockResolvedValue([] as never) as any;

    ListProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/products?disabled=false");

    expect(executeMock).toHaveBeenCalledWith({ disabled: false });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    ListProductServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/products");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
