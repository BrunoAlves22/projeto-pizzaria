import { NextFunction, Request, Response } from "express";
import { LogoutService } from "../../services/user/LogoutService";

class LogoutController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.user_id;

      const logoutService = new LogoutService();
      const result = await logoutService.execute({ id });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export { LogoutController };
