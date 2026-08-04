import { Request, Response, NextFunction } from "express";
import { DeleteOrderService } from "../../services/order/DeleteOrderService";

class DeleteOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.query;

      const deleteOrderService = new DeleteOrderService();

      const orderDeleted = await deleteOrderService.execute({
        orderId: String(orderId),
      });

      return res.json(orderDeleted);
    } catch (error) {
      return next(error);
    }
  }
}

export { DeleteOrderController };
