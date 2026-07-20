import { NextFunction, Request, Response } from "express";
import { ListProductByCategoryService } from "../../services/products/ListProductByCategoryService";

class ListProductByCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { category_id } = req.query;

      const listProductByCategoryService = new ListProductByCategoryService();
      const products = await listProductByCategoryService.execute({
        category_id: String(category_id),
      });

      return res.status(200).json(products);
    } catch (error) {
      return next(error);
    }
  }
}

export { ListProductByCategoryController };
