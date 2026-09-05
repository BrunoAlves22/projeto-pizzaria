import { NextFunction, Request, Response } from "express";
import { ListUserService } from "../../services/user/ListUserService";

class ListUserController {
  async handle(_req: Request, res: Response, next: NextFunction) {
    try {
      const listUserService = new ListUserService();
      const users = await listUserService.execute();

      return res.status(200).json(users);
    } catch (error) {
      return next(error);
    }
  }
}

export { ListUserController };
