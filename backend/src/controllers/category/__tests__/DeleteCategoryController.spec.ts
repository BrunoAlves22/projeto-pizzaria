import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DeleteCategoryController } from "../DeleteCategoryController";
import { DeleteCategoryService } from "../../../services/category/DeleteCategoryService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/category/DeleteCategoryService");

const app = express();
app.use(express.json());
app.delete("/category", (req, res, next) =>
  new DeleteCategoryController().handle(req, res, next),
);
app.use(errorHandler);

const DeleteCategoryServiceMock = DeleteCategoryService as jest.MockedClass<
  typeof DeleteCategoryService
>;

describe("DeleteCategoryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const fakeResponse = { message: "Categoria deletada com sucesso" };
    const executeMock = jest.fn().mockResolvedValue(fakeResponse as never) as any;

    DeleteCategoryServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).delete("/category?category_id=cat-id-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResponse);
  });

  it("deve chamar o service com o category_id recebido via query", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    DeleteCategoryServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).delete("/category?category_id=cat-id-1");

    expect(executeMock).toHaveBeenCalledWith({ category_id: "cat-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de categoria não encontrada", async () => {
    DeleteCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Categoria não encontrada", 404) as never,
        ) as any,
    }));

    const res = await request(app).delete(
      "/category?category_id=cat-inexistente",
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Categoria não encontrada" });
  });

  it("deve retornar 409 se o service lançar AppError de categoria com produtos vinculados", async () => {
    DeleteCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError(
            "Não é possível excluir uma categoria que possui produtos vinculados",
            409,
          ) as never,
        ) as any,
    }));

    const res = await request(app).delete("/category?category_id=cat-id-1");

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      message: "Não é possível excluir uma categoria que possui produtos vinculados",
    });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    DeleteCategoryServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).delete("/category?category_id=cat-id-1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
