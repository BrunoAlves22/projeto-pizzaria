import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { AddItemOrderService } from "../AddItemOrderService";
import { AppError } from "../../../errors/AppError";
import prismaClient from "../../../prisma";

jest.mock("../../../prisma", () => ({
  order: {
    findFirst: jest.fn(),
  },
  product: {
    findFirst: jest.fn(),
  },
  orderItem: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const orderFindFirstMock = prismaClient.order.findFirst as jest.MockedFunction<
  typeof prismaClient.order.findFirst
>;
const productFindFirstMock =
  prismaClient.product.findFirst as jest.MockedFunction<
    typeof prismaClient.product.findFirst
  >;
const itemFindFirstMock =
  prismaClient.orderItem.findFirst as jest.MockedFunction<
    typeof prismaClient.orderItem.findFirst
  >;
const createMock = prismaClient.orderItem.create as jest.MockedFunction<
  typeof prismaClient.orderItem.create
>;
const updateMock = prismaClient.orderItem.update as jest.MockedFunction<
  typeof prismaClient.orderItem.update
>;

const itemSelect = {
  id: true,
  amount: true,
  orderId: true,
  productId: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      banner: true,
    },
  },
};

describe("AddItemOrderService", () => {
  let service: AddItemOrderService;

  const dto = {
    orderId: "order-id-1",
    productId: "prod-id-1",
    amount: 2,
  };

  beforeEach(() => {
    service = new AddItemOrderService();
    jest.clearAllMocks();
  });

  it("deve criar um novo item quando o produto ainda não está no pedido", async () => {
    orderFindFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    productFindFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    itemFindFirstMock.mockResolvedValue(null);

    const fakeItem = {
      id: "item-id-1",
      amount: 2,
      orderId: "order-id-1",
      productId: "prod-id-1",
      createdAt: new Date(),
      product: {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        price: 4500,
        description: "Molho, mussarela e calabresa",
        banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      },
    };
    createMock.mockResolvedValue(fakeItem as never);

    const result = await service.execute(dto);

    expect(result).toEqual(fakeItem);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deve consultar order, produto e item existente com os dados corretos", async () => {
    orderFindFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    productFindFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    itemFindFirstMock.mockResolvedValue(null);
    createMock.mockResolvedValue({} as never);

    await service.execute(dto);

    expect(orderFindFirstMock).toHaveBeenCalledWith({
      where: { id: "order-id-1" },
    });
    expect(productFindFirstMock).toHaveBeenCalledWith({
      where: { id: "prod-id-1", disabled: false },
    });
    expect(itemFindFirstMock).toHaveBeenCalledWith({
      where: { orderId: "order-id-1", productId: "prod-id-1" },
    });
    expect(createMock).toHaveBeenCalledWith({
      data: {
        orderId: "order-id-1",
        productId: "prod-id-1",
        amount: 2,
      },
      select: itemSelect,
    });
  });

  it("deve somar a quantidade a um item já existente do mesmo produto, sem criar outro", async () => {
    orderFindFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    productFindFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    itemFindFirstMock.mockResolvedValue({
      id: "item-existente",
      orderId: "order-id-1",
      productId: "prod-id-1",
      amount: 1,
    } as never);

    const fakeUpdated = {
      id: "item-existente",
      amount: 3,
      orderId: "order-id-1",
      productId: "prod-id-1",
      createdAt: new Date(),
      product: {
        id: "prod-id-1",
        name: "Pizza Calabresa",
        price: 4500,
        description: "Molho, mussarela e calabresa",
        banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      },
    };
    updateMock.mockResolvedValue(fakeUpdated as never);

    const result = await service.execute(dto);

    expect(result).toEqual(fakeUpdated);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "item-existente" },
      data: { amount: { increment: 2 } },
      select: itemSelect,
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 404 se o pedido não existir e não deve buscar o produto", async () => {
    orderFindFirstMock.mockResolvedValue(null);

    await expect(service.execute(dto)).rejects.toEqual(
      new AppError("Pedido não encontrado", 404),
    );

    expect(productFindFirstMock).not.toHaveBeenCalled();
    expect(itemFindFirstMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 404 se o produto não existir ou estiver desabilitado", async () => {
    orderFindFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    productFindFirstMock.mockResolvedValue(null);

    await expect(service.execute(dto)).rejects.toEqual(
      new AppError("Produto não encontrado", 404),
    );

    expect(itemFindFirstMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a criação do item falhar", async () => {
    orderFindFirstMock.mockResolvedValue({ id: "order-id-1" } as never);
    productFindFirstMock.mockResolvedValue({ id: "prod-id-1" } as never);
    itemFindFirstMock.mockResolvedValue(null);
    createMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute(dto)).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
