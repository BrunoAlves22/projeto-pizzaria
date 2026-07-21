import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { CreateOrderController } from "../CreateOrderController";
import { CreateOrderService } from "../../../services/order/CreateOrderService";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/CreateOrderService");

const app = express();
app.use(express.json());
app.post("/order", (req, res, next) =>
  new CreateOrderController().handle(req, res, next),
);
app.use(errorHandler);

const CreateOrderServiceMock = CreateOrderService as jest.MockedClass<
  typeof CreateOrderService
>;

describe("CreateOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e o pedido criado", async () => {
    const fakeOrder = {
      id: "order-id-1",
      table: 5,
      name: "João Silva",
      status: false,
      draft: true,
      createdAt: new Date().toISOString(),
    };
    const executeMock = jest.fn().mockResolvedValue(fakeOrder as never) as any;

    CreateOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app)
      .post("/order")
      .send({ table: 5, name: "João Silva" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeOrder);
  });

  it("deve chamar o service com table e name recebidos via body", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    CreateOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).post("/order").send({ table: 5, name: "João Silva" });

    expect(executeMock).toHaveBeenCalledWith({ table: 5, name: "João Silva" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    CreateOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app)
      .post("/order")
      .send({ table: 5, name: "João Silva" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
