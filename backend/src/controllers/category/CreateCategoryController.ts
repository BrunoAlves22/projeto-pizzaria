import { NextFunction, Request, Response } from "express";
import { CreateCategoryService } from "../../services/category/CreateCategoryService";

class CreateCategoryController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      const createCategoryService = new CreateCategoryService();
      const category = await createCategoryService.execute({ name });

      return res.status(201).json(category);
    } catch (error) {
      return next(error);
    }
  }
}

export { CreateCategoryController };
