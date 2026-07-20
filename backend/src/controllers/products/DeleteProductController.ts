import { NextFunction, Request, Response } from "express";
import { DeleteProductService } from "../../services/products/DeleteProductService";

class DeleteProductController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { product_id } = req.query;

      const deleteProductService = new DeleteProductService();

      const deleted = await deleteProductService.execute({
        product_id: String(product_id),
      });

      return res.json(deleted);
    } catch (error) {
      return next(error);
    }
  }
}

export { DeleteProductController };
