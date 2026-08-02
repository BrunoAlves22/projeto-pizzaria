import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { SendOrderController } from "../SendOrderController";
import { SendOrderService } from "../../../services/order/SendOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/SendOrderService");

const app = express();
app.use(express.json());
app.put("/order/send", (req, res, next) =>
  new SendOrderController().handle(req, res, next),
);
app.use(errorHandler);

const SendOrderServiceMock = SendOrderService as jest.MockedClass<
  typeof SendOrderService
>;

describe("SendOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e o pedido enviado", async () => {
    const fakeOrder = {
      id: "order-id-1",
      name: "João Silva",
      draft: false,
      table: 5,
      status: false,
      createdAt: new Date().toISOString(),
    };
    const executeMock = jest.fn().mockResolvedValue(fakeOrder as never) as any;

    SendOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).put("/order/send").send({
      name: "João Silva",
      orderId: "order-id-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrder);
  });

  it("deve chamar o service com o name e orderId recebidos via body", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    SendOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).put("/order/send").send({
      name: "João Silva",
      orderId: "order-id-1",
    });

    expect(executeMock).toHaveBeenCalledWith({
      name: "João Silva",
      orderId: "order-id-1",
    });
  });

  it("deve retornar 404 se o service lançar AppError de pedido não encontrado", async () => {
    SendOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Pedido não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).put("/order/send").send({
      name: "João Silva",
      orderId: "order-inexistente",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Pedido não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    SendOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).put("/order/send").send({
      name: "João Silva",
      orderId: "order-id-1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
