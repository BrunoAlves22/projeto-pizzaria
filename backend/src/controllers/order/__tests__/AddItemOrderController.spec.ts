import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import { AddItemOrderController } from "../AddItemOrderController";
import { AddItemOrderService } from "../../../services/order/AddItemOrderService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";

jest.mock("../../../services/order/AddItemOrderService");

const app = express();
app.use(express.json());
app.post("/order/add", (req, res, next) =>
  new AddItemOrderController().handle(req, res, next),
);
app.use(errorHandler);

const AddItemOrderServiceMock = AddItemOrderService as jest.MockedClass<
  typeof AddItemOrderService
>;

describe("AddItemOrderController", () => {
  const body = {
    orderId: "order-id-1",
    productId: "prod-id-1",
    amount: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e o item criado", async () => {
    const fakeItem = {
      id: "item-id-1",
      amount: 2,
      orderId: "order-id-1",
      productId: "prod-id-1",
      createdAt: new Date().toISOString(),
      product: {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        price: 4500,
        description: "Molho, mussarela e calabresa",
        banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      },
    };
    const executeMock = jest.fn().mockResolvedValue(fakeItem as never) as any;

    AddItemOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    const res = await request(app).post("/order/add").send(body);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeItem);
  });

  it("deve chamar o service com orderId, productId e amount recebidos via body", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;

    AddItemOrderServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app).post("/order/add").send(body);

    expect(executeMock).toHaveBeenCalledWith(body);
  });

  it("deve retornar 404 se o service lançar AppError de pedido não encontrado", async () => {
    AddItemOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Pedido não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).post("/order/add").send(body);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Pedido não encontrado" });
  });

  it("deve retornar 404 se o service lançar AppError de produto não encontrado", async () => {
    AddItemOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Produto não encontrado", 404) as never,
        ) as any,
    }));

    const res = await request(app).post("/order/add").send(body);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Produto não encontrado" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    AddItemOrderServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app).post("/order/add").send(body);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
