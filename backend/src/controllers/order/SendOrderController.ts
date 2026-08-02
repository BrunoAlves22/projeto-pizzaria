import { Request, Response, NextFunction } from "express";
import { SendOrderService } from "../../services/order/SendOrderService";

class SendOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, orderId } = req.body;

      const sendOrderService = new SendOrderService();

      const orderSent = await sendOrderService.execute({ name, orderId });

      return res.json(orderSent);
    } catch (error) {
      return next(error);
    }
  }
}

export { SendOrderController };
