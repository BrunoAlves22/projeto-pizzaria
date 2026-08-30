import { NextFunction, Request, Response } from "express";
import { DeleteCategoryService } from "../../services/category/DeleteCategoryService";

class DeleteCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { category_id } = req.query;

      const deleteCategoryService = new DeleteCategoryService();

      const deleted = await deleteCategoryService.execute({
        category_id: String(category_id),
      });

      return res.json(deleted);
    } catch (error) {
      return next(error);
    }
  }
}

export { DeleteCategoryController };
