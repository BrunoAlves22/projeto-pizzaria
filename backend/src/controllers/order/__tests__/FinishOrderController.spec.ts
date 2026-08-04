import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { FinishOrderController } from "../FinishOrderController";
import { FinishOrderService } from "../../../services/order/FinishOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/FinishOrderService");

const app = express();
app.use(express.json());
app.put("/order/finish", (req, res, next) =>
  new FinishOrderController().handle(req, res, next),
);
app.use(errorHandler);

const FinishOrderServiceMock = FinishOrderService as jest.MockedClass<
  typeof FinishOrderService
>;

describe("FinishOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e o pedido finalizado", async () => {
    const fakeOrder = {
      id: "order-id-1",
      name: "João Silva",
      draft: false,
      table: 5,
      status: true,
      createdAt: new Date().toISOString(),
    };
    const executeMock = jest.fn().mockResolvedValue(fakeOrder as never) as any;

    FinishOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).put("/order/finish").send({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrder);
  });

  it("deve chamar o service com o orderId recebido via body", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    FinishOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).put("/order/finish").send({
      orderId: "order-id-1",
    });

    expect(executeMock).toHaveBeenCalledWith({ orderId: "order-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de pedido não encontrado", async () => {
    FinishOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Pedido não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).put("/order/finish").send({
      orderId: "order-inexistente",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Pedido não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    FinishOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).put("/order/finish").send({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
