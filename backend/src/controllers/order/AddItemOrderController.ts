import { Response, Request, NextFunction } from "express";
import { AddItemOrderService } from "../../services/order/AddItemOrderService";

class AddItemOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, productId, amount } = req.body;

      const addItemOrderService = new AddItemOrderService();

      const item = await addItemOrderService.execute({
        orderId,
        productId,
        amount,
      });

      return res.status(201).json(item);
    } catch (error) {
      return next(error);
    }
  }
}

export { AddItemOrderController };
