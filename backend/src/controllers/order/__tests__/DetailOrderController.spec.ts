import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { DetailOrderController } from "../DetailOrderController";
import { DetailOrderService } from "../../../services/order/DetailOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/DetailOrderService");

const app = express();
app.use(express.json());
app.get("/order/detail", (req, res, next) =>
  new DetailOrderController().handle(req, res, next),
);
app.use(errorHandler);

const DetailOrderServiceMock = DetailOrderService as jest.MockedClass<
  typeof DetailOrderService
>;

describe("DetailOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e os detalhes do pedido", async () => {
    const fakeOrder = {
      id: "order-id-1",
      table: 5,
      name: "João Silva",
      draft: true,
      status: false,
      createdAt: new Date().toISOString(),
      orderItems: [
        {
          id: "item-id-1",
          amount: 2,
          product: {
            id: "prod-id-1",
            name: "Pizza Calabresa",
            description: "Molho, mussarela e calabresa",
            price: 4500,
            banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
          },
        },
      ],
    };
    const executeMock = jest.fn().mockResolvedValue(fakeOrder as never) as any;

    DetailOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).get("/order/detail").query({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrder);
  });

  it("deve chamar o service com o orderId recebido via query param", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    DetailOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).get("/order/detail").query({
      orderId: "order-id-1",
    });

    expect(executeMock).toHaveBeenCalledWith({ orderId: "order-id-1" });
  });

  it("deve retornar 404 se o service lançar AppError de pedido não encontrado", async () => {
    DetailOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Pedido não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).get("/order/detail").query({
      orderId: "order-inexistente",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Pedido não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    DetailOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).get("/order/detail").query({
      orderId: "order-id-1",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
