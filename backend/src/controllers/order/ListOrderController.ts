import { NextFunction, Request, Response } from "express";
import { ListOrderService } from "../../services/order/ListOrderService";

class ListOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { draft } = req.query;

      const listOrderService = new ListOrderService();

      const orders = await listOrderService.execute({
        draft: draft as string,
      });

      return res.json(orders);
    } catch (error) {
      return next(error);
    }
  }
}

export { ListOrderController };
