import { NextFunction, Request, Response } from "express";
import { MoveCategoryProductsService } from "../../services/category/MoveCategoryProductsService";

class MoveCategoryProductsController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, targetCategoryId } = req.body;

      const moveCategoryProductsService = new MoveCategoryProductsService();

      const result = await moveCategoryProductsService.execute({
        categoryId,
        targetCategoryId,
      });

      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export { MoveCategoryProductsController };
