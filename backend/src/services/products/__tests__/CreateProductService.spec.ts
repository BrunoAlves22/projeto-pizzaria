import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { PassThrough } from "stream";
import { CreateProductService } from "../CreateProductService";
import prismaClient from "../../../prisma";
import cloudinary from "../../../config/cloudinary";
import { AppError } from "../../../errors/AppError";

jest.mock("../../../prisma", () => ({
  category: {
    findFirst: jest.fn(),
  },
  product: {
    create: jest.fn(),
  },
}));

jest.mock("../../../config/cloudinary", () => ({
  uploader: {
    upload_stream: jest.fn(),
  },
}));

const findFirstMock = prismaClient.category.findFirst as jest.MockedFunction<
  typeof prismaClient.category.findFirst
>;
const createMock = prismaClient.product.create as jest.MockedFunction<
  typeof prismaClient.product.create
>;
const uploadStreamMock = cloudinary.uploader.upload_stream as jest.Mock;

function mockSuccessfulUpload(secureUrl: string) {
  uploadStreamMock.mockImplementation((_options: unknown, callback: any) => {
    const stream = new PassThrough();
    process.nextTick(() => callback(null, { secure_url: secureUrl }));
    return stream;
  });
}

function mockFailedUpload(error: Error) {
  uploadStreamMock.mockImplementation((_options: unknown, callback: any) => {
    const stream = new PassThrough();
    process.nextTick(() => callback(error, undefined));
    return stream;
  });
}

describe("CreateProductService", () => {
  let service: CreateProductService;

  const dto = {
    name: "Pizza Calabresa",
    description: "Molho, mussarela e calabresa",
    price: 4500,
    categoryId: "cat-id-1",
    imageBuffer: Buffer.from("fake-image"),
    imageName: "calabresa.png",
  };

  beforeEach(() => {
    service = new CreateProductService();
    jest.clearAllMocks();
  });

  it("deve criar um produto com sucesso e retornar os campos selecionados", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    mockSuccessfulUpload("https://res.cloudinary.com/pizzaria/calabresa.jpg");

    const fakeProduct = {
      id: "prod-id-1",
      name: dto.name,
      description: dto.description,
      price: dto.price,
      banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      categoryId: dto.categoryId,
      createdAt: new Date(),
    };
    createMock.mockResolvedValue(fakeProduct as never);

    const result = await service.execute(dto);

    expect(result).toEqual(fakeProduct);
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: "cat-id-1" },
    });
    expect(uploadStreamMock).toHaveBeenCalledTimes(1);
  });

  it("deve chamar o prisma.product.create com o banner retornado pelo Cloudinary", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    mockSuccessfulUpload("https://res.cloudinary.com/pizzaria/calabresa.jpg");
    createMock.mockResolvedValue({} as never);

    await service.execute(dto);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        banner: true,
        categoryId: true,
        createdAt: true,
      },
    });
  });

  it("deve lançar AppError 404 se a categoria não existir e não deve subir a imagem", async () => {
    findFirstMock.mockResolvedValue(null);

    await expect(service.execute(dto)).rejects.toThrow(
      new AppError("Categoria não encontrada", 404),
    );

    expect(uploadStreamMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("deve lançar AppError 502 se o upload para o Cloudinary falhar", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    mockFailedUpload(new Error("Cloudinary indisponível"));

    await expect(service.execute(dto)).rejects.toThrow(
      new AppError("Erro ao fazer upload da imagem para o Cloudinary", 502),
    );

    expect(createMock).not.toHaveBeenCalled();
  });

  it("deve propagar o erro do prisma se a criação do produto falhar", async () => {
    findFirstMock.mockResolvedValue({ id: "cat-id-1" } as never);
    mockSuccessfulUpload("https://res.cloudinary.com/pizzaria/calabresa.jpg");
    createMock.mockRejectedValue(new Error("Erro de banco de dados") as never);

    await expect(service.execute(dto)).rejects.toThrow(
      "Erro de banco de dados",
    );
  });
});
