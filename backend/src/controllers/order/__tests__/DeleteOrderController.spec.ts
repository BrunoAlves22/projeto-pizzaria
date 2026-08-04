import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DeleteOrderController } from "../DeleteOrderController";
import { DeleteOrderService } from "../../../services/order/DeleteOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/DeleteOrderService");

const app = express();
app.use(express.json());
app.delete("/order/delete", (req, res, next) =>
  new DeleteOrderController().handle(req, res, next),
);
app.use(errorHandler);

const DeleteOrderServiceMock = DeleteOrderService as jest.MockedClass<
  typeof DeleteOrderService
>;

describe("DeleteOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a mensagem de sucesso", async () => {
    const fakeResult = { message: "Pedido deletado com sucesso" };
    const executeMock = jest
      .fn()
      .mockResolvedValue(fakeResult as never) as any;

    DeleteOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).delete("/order/delete").query({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeResult);
  });

  it("deve chamar o service com o orderId recebido via query param", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    DeleteOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).delete("/order/delete").query({
      orderId: "order-id-1",
    });

    expect(executeMock).toHaveBeenCalledWith({ orderId: "order-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de pedido não encontrado", async () => {
    DeleteOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Pedido não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).delete("/order/delete").query({
      orderId: "order-inexistente",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Pedido não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    DeleteOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).delete("/order/delete").query({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
