import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { MoveCategoryProductsController } from "../MoveCategoryProductsController";
import { MoveCategoryProductsService } from "../../../services/category/MoveCategoryProductsService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/category/MoveCategoryProductsService");

const app = express();
app.use(express.json());
app.patch("/category/products", (req, res, next) =>
  new MoveCategoryProductsController().handle(req, res, next),
);
app.use(errorHandler);

const MoveCategoryProductsServiceMock =
  MoveCategoryProductsService as jest.MockedClass<
    typeof MoveCategoryProductsService
  >;

describe("MoveCategoryProductsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const fakeResponse = { message: "Produtos movidos com sucesso", count: 2 };
    const executeMock = jest.fn().mockResolvedValue(fakeResponse as never) as any;

    MoveCategoryProductsServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app)
      .patch("/category/products")
      .send({ categoryId: "cat-origem", targetCategoryId: "cat-destino" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResponse);
  });

  it("deve chamar o service com os ids recebidos no body", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    MoveCategoryProductsServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app)
      .patch("/category/products")
      .send({ categoryId: "cat-origem", targetCategoryId: "cat-destino" });

    expect(executeMock).toHaveBeenCalledWith({
      categoryId: "cat-origem",
      targetCategoryId: "cat-destino",
    });
  });

  it("deve retornar 404 se o service lançar AppError de categoria não encontrada", async () => {
    MoveCategoryProductsServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Categoria de origem não encontrada", 404) as never,
        ) as any,
    }));

    const res = await request(app)
      .patch("/category/products")
      .send({ categoryId: "cat-inexistente", targetCategoryId: "cat-destino" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Categoria de origem não encontrada" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    MoveCategoryProductsServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app)
      .patch("/category/products")
      .send({ categoryId: "cat-origem", targetCategoryId: "cat-destino" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
