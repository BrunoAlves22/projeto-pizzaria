import { NextFunction, Request, Response } from "express";
import { ListProductService } from "../../services/products/ListProductService";

class ListProductController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const disabled = req.query.disabled === "true";

      const listProductService = new ListProductService();
      const products = await listProductService.execute({ disabled });

      return res.status(200).json(products);
    } catch (error) {
      return next(error);
    }
  }
}

export { ListProductController };
