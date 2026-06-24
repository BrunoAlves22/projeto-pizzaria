import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { CreateCategoryController } from "../CreateCategoryController";
import { CreateCategoryService } from "../../../services/category/CreateCategoryService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/category/CreateCategoryService");

const app = express();
app.use(express.json());
app.post("/category", (req, res, next) => new CreateCategoryController().handle(req, res, next));
app.use(errorHandler);

const CreateCategoryServiceMock = CreateCategoryService as jest.MockedClass<
  typeof CreateCategoryService
>;

describe("CreateCategoryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e os dados da categoria criada", async () => {
    const fakeCategory = {
      id: "cat-id-1",
      name: "Pizzas",
      createdAt: new Date().toISOString(),
    };

    CreateCategoryServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeCategory as never) as any,
    }));

    const res = await request(app).post("/category").send({ name: "Pizzas" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeCategory);
  });

  it("deve retornar 500 em caso de erro inesperado do banco", async () => {
    CreateCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).post("/category").send({ name: "Pizzas" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });

  it("deve chamar o service com o name correto", async () => {
    const executeMock = jest
      .fn()
      .mockResolvedValue({ id: "cat-id-1", name: "Bebidas" } as never) as any;

    CreateCategoryServiceMock.mockImplementation(() => ({ execute: executeMock }));

    await request(app).post("/category").send({ name: "Bebidas" });

    expect(executeMock).toHaveBeenCalledWith({ name: "Bebidas" });
  });
});
