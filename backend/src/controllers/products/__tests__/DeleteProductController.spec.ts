import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DeleteProductController } from "../DeleteProductController";
import { DeleteProductService } from "../../../services/products/DeleteProductService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/products/DeleteProductService");

const app = express();
app.use(express.json());
app.delete("/product", (req, res, next) =>
  new DeleteProductController().handle(req, res, next),
);
app.use(errorHandler);

const DeleteProductServiceMock = DeleteProductService as jest.MockedClass<
  typeof DeleteProductService
>;

describe("DeleteProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const fakeResponse = { message: "Produto deletado com sucesso" };
    const executeMock = jest.fn().mockResolvedValue(fakeResponse as never) as any;

    DeleteProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).delete("/product?product_id=prod-id-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResponse);
  });

  it("deve chamar o service com o product_id recebido via query", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    DeleteProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).delete("/product?product_id=prod-id-1");

    expect(executeMock).toHaveBeenCalledWith({ product_id: "prod-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de produto não encontrado", async () => {
    DeleteProductServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Produto não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).delete(
      "/product?product_id=prod-inexistente",
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Produto não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    DeleteProductServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).delete("/product?product_id=prod-id-1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
