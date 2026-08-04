import { Request, Response, NextFunction } from "express";
import { FinishOrderService } from "../../services/order/FinishOrderService";

class FinishOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;

      const finishOrderService = new FinishOrderService();

      const orderFinished = await finishOrderService.execute({ orderId });

      return res.json(orderFinished);
    } catch (error) {
      return next(error);
    }
  }
}

export { FinishOrderController };
