import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { RemoveItemOrderController } from "../RemoveItemOrderController";
import { RemoveItemOrderService } from "../../../services/order/RemoveItemOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/RemoveItemOrderService");

const app = express();
app.use(express.json());
app.delete("/order/remove", (req, res, next) =>
  new RemoveItemOrderController().handle(req, res, next),
);
app.use(errorHandler);

const RemoveItemOrderServiceMock = RemoveItemOrderService as jest.MockedClass<
  typeof RemoveItemOrderService
>;

describe("RemoveItemOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const executeMock = jest
      .fn()
      .mockResolvedValue({ message: "Item deletado com sucesso" } as never) as any;

    RemoveItemOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).delete("/order/remove").query({
      itemId: "item-id-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Item deletado com sucesso" });
  });

  it("deve chamar o service com o itemId recebido via query param", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    RemoveItemOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).delete("/order/remove").query({
      itemId: "item-id-1",
    });

    expect(executeMock).toHaveBeenCalledWith({ itemId: "item-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de item não encontrado", async () => {
    RemoveItemOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new AppError("Item não encontrado", 404) as never) as any,
    }));

    const res = await request(app).delete("/order/remove").query({
      itemId: "item-inexistente",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Item não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    RemoveItemOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).delete("/order/remove").query({
      itemId: "item-id-1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
