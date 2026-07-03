import { NextFunction, Request, Response } from "express";
import { CreateProductService } from "../../services/products/CreateProductService";

class CreateProductController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const createProductService = new CreateProductService();

      const product = await createProductService.execute();

      return res.status(201).json(product);
    } catch (error) {
      return next(error);
    }
  }
}

export { CreateProductController };
