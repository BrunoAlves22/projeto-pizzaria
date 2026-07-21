import { NextFunction, Request, Response } from "express";
import { CreateOrderService } from "../../services/order/CreateOrderService";

class CreateOrderController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { table, name } = req.body;

      const createOrderService = new CreateOrderService();
      const order = await createOrderService.execute({ table, name });

      return res.status(201).json(order);
    } catch (error) {
      return next(error);
    }
  }
}

export { CreateOrderController };
