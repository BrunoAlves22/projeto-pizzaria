import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ListCategoryController } from "../ListCategoryController";
import { ListCategoryService } from "../../../services/category/ListCategoryService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/category/ListCategoryService");

const app = express();
app.use(express.json());
app.get("/category-list", (req, res, next) =>
  new ListCategoryController().handle(req, res, next),
);
app.use(errorHandler);

const ListCategoryServiceMock = ListCategoryService as jest.MockedClass<
  typeof ListCategoryService
>;

describe("ListCategoryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a lista de categorias", async () => {
    const fakeCategories = [
      { id: "cat-id-1", name: "Bebidas", createdAt: new Date().toISOString() },
      { id: "cat-id-2", name: "Pizzas", createdAt: new Date().toISOString() },
    ];

    ListCategoryServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeCategories as never) as any,
    }));

    const res = await request(app).get("/category-list");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCategories);
  });

  it("deve retornar 200 e lista vazia quando não há categorias", async () => {
    ListCategoryServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue([] as never) as any,
    }));

    const res = await request(app).get("/category-list");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("deve retornar 500 em caso de erro inesperado do banco", async () => {
    ListCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/category-list");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
