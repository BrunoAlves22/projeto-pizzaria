import { NextFunction, Request, Response } from "express";
import { RemoveItemOrderService } from "../../services/order/RemoveItemOrderService";

class RemoveItemOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.query;

      const removeItemOrderService = new RemoveItemOrderService();

      const deleted = await removeItemOrderService.execute({
        itemId: String(itemId),
      });

      return res.json(deleted);
    } catch (error) {
      return next(error);
    }
  }
}

export { RemoveItemOrderController };
