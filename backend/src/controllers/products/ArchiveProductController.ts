import { NextFunction, Request, Response } from "express";
import { ArchiveProductService } from "../../services/products/ArchiveProductService";

class ArchiveProductController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { product_id } = req.query;

      const archiveProductService = new ArchiveProductService();

      const archive = await archiveProductService.execute({
        product_id: String(product_id),
      });

      return res.json(archive);
    } catch (error) {
      return next(error);
    }
  }
}

export { ArchiveProductController };
