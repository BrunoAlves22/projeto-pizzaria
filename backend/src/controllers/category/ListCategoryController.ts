import { NextFunction, Request, Response } from "express";
import { ListCategoryService } from "../../services/category/ListCategoryService";

class ListCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const listCategoryService = new ListCategoryService();
      const categories = await listCategoryService.execute();

      return res.status(200).json(categories);
    } catch (error) {
      return next(error);
    }
  }
}

export { ListCategoryController };
