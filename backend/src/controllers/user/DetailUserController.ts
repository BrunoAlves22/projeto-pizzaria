import { NextFunction, Request, Response } from "express";
import { DetailUserService } from "../../services/user/DetailUserService";

class DetailUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.user_id;

      const detailUserService = new DetailUserService();
      const user = await detailUserService.execute({ id });

      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  }
}

export { DetailUserController };
