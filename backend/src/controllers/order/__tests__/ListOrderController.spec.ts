import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { ListOrderController } from "../ListOrderController";
import { ListOrderService } from "../../../services/order/ListOrderService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/ListOrderService");

const app = express();
app.use(express.json());
app.get("/orders", (req, res, next) =>
  new ListOrderController().handle(req, res, next),
);
app.use(errorHandler);

const ListOrderServiceMock = ListOrderService as jest.MockedClass<
  typeof ListOrderService
>;

describe("ListOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e a lista de pedidos", async () => {
    const fakeOrders = [
      {
        id: "order-id-1",
        table: 5,
        name: "João Silva",
        draft: true,
        status: false,
        createdAt: new Date().toISOString(),
        orderItems: [],
      },
    ];
    const executeMock = jest.fn().mockResolvedValue(fakeOrders as never) as any;

    ListOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).get("/orders?draft=true");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrders);
  });

  it("deve chamar o service com o draft recebido via query", async () => {
    const executeMock = jest.fn().mockResolvedValue([] as never) as any;

    ListOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/orders?draft=false");

    expect(executeMock).toHaveBeenCalledWith({ draft: "false" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    ListOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/orders?draft=true");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
