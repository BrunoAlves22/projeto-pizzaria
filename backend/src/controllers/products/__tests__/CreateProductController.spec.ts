import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import multer from "multer";
import { CreateProductController } from "../CreateProductController";
import { CreateProductService } from "../../../services/products/CreateProductService";
import { AppError } from "../../../errors/AppError";
import { errorHandler } from "../../../middlewares/errorHandler";
import uploadConfig from "../../../config/multer";

jest.mock("../../../services/products/CreateProductService");

const upload = multer(uploadConfig);

const app = express();
app.use(express.json());
app.post(
  "/product",
  upload.single("file"),
  (req, res, next) => new CreateProductController().handle(req, res, next),
);
app.use(errorHandler);

const CreateProductServiceMock = CreateProductService as jest.MockedClass<
  typeof CreateProductService
>;

describe("CreateProductController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e os dados do produto criado", async () => {
    const fakeProduct = {
      id: "prod-id-1",
      name: "Pizza Calabresa",
      description: "Molho, mussarela e calabresa",
      price: 4500,
      banner: "https://res.cloudinary.com/pizzaria/calabresa.jpg",
      categoryId: "cat-id-1",
      createdAt: new Date().toISOString(),
    };

    CreateProductServiceMock.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(fakeProduct as never) as any,
    }));

    const res = await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-id-1")
      .attach("file", Buffer.from("fake-image"), {
        filename: "calabresa.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeProduct);
  });

  it("deve chamar o service com os dados corretos, convertendo price para número", async () => {
    const executeMock = jest.fn().mockResolvedValue({} as never) as any;
    CreateProductServiceMock.mockImplementation(() => ({
      execute: executeMock,
    }));

    await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-id-1")
      .attach("file", Buffer.from("fake-image"), {
        filename: "calabresa.png",
        contentType: "image/png",
      });

    expect(executeMock).toHaveBeenCalledWith({
      name: "Pizza Calabresa",
      description: "Molho, mussarela e calabresa",
      price: 4500,
      categoryId: "cat-id-1",
      imageBuffer: expect.any(Buffer),
      imageName: "calabresa.png",
    });
  });

  it("deve retornar 400 se nenhum arquivo for enviado", async () => {
    const res = await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-id-1");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Nenhum arquivo enviado" });
    expect(CreateProductServiceMock).not.toHaveBeenCalled();
  });

  it("deve retornar 500 se o arquivo enviado não for uma imagem permitida", async () => {
    const res = await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-id-1")
      .attach("file", Buffer.from("fake-file"), {
        filename: "arquivo.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(500);
    expect(CreateProductServiceMock).not.toHaveBeenCalled();
  });

  it("deve retornar 404 se o service lançar AppError de categoria não encontrada", async () => {
    CreateProductServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(
          new AppError("Categoria não encontrada", 404) as never,
        ) as any,
    }));

    const res = await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-inexistente")
      .attach("file", Buffer.from("fake-image"), {
        filename: "calabresa.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Categoria não encontrada" });
  });

  it("deve retornar 500 em caso de erro inesperado do service", async () => {
    CreateProductServiceMock.mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro de banco de dados") as never) as any,
    }));

    const res = await request(app)
      .post("/product")
      .field("name", "Pizza Calabresa")
      .field("description", "Molho, mussarela e calabresa")
      .field("price", "4500")
      .field("categoryId", "cat-id-1")
      .attach("file", Buffer.from("fake-image"), {
        filename: "calabresa.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Erro interno do servidor" });
  });
});
