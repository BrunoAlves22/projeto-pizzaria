import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ListProductByCategoryController } from "../ListProductByCategoryController";
import { ListProductByCategoryService } from "../../../services/products/ListProductByCategoryService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/products/ListProductByCategoryService");

const app = express();
app.use(express.json());
app.get("/category/product", (req, res, next) =>
  new ListProductByCategoryController().handle(req, res, next),
);
app.use(errorHandler);

const ListProductByCategoryServiceMock =
  ListProductByCategoryService as jest.MockedClass<
    typeof ListProductByCategoryService
  >;

describe("ListProductByCategoryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a lista de produtos da categoria", async () => {
    const fakeProducts = [
      {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        categoryId: "cat-id-1",
        createdAt: new Date().toISOString(),
      },
    ];
    const executeMock = jest.fn().mockResolvedValue(fakeProducts as never) as any;

    ListProductByCategoryServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).get("/category/product?category_id=cat-id-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeProducts);
  });

  it("deve chamar o service com o category_id recebido via query", async () => {
    const executeMock = jest.fn().mockResolvedValue([] as never) as any;

    ListProductByCategoryServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/category/product?category_id=cat-id-1");

    expect(executeMock).toHaveBeenCalledWith({ category_id: "cat-id-1" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    ListProductByCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/category/product?category_id=cat-id-1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
