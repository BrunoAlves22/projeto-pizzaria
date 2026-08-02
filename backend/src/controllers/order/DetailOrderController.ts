import { NextFunction, Request, Response } from "express";
import { DetailOrderService } from "../../services/order/DetailOrderService";

class DetailOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.query;

      const detailOrderService = new DetailOrderService();

      const order = await detailOrderService.execute({
        orderId: String(orderId),
      });

      return res.status(200).json(order);
    } catch (error) {
      return next(error);
    }
  }
}

export { DetailOrderController };
