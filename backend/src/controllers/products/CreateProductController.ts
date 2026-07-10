import { NextFunction, Request, Response } from "express";
import { CreateProductService } from "../../services/products/CreateProductService";
import { AppError } from "../../errors/AppError";

class CreateProductController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, categoryId } = req.body;

      if (!req.file) {
        throw new AppError("Nenhum arquivo enviado", 400);
      }

      const createProductService = new CreateProductService();

      const product = await createProductService.execute({
        name,
        description,
        price: parseInt(price, 10),
        categoryId,
        imageBuffer: req.file.buffer,
        imageName: req.file.originalname,
      });

      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  }
}

export { CreateProductController };
