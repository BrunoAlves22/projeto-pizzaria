import { NextFunction, Request, Response } from "express";
import { AuthUserService } from "../../services/user/AuthUserService";

class AuthUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const authUserService = new AuthUserService();
      const session = await authUserService.execute({ email, password });

      return res.status(200).json(session);
    } catch (error) {
      return next(error);
    }
  }
}

export { AuthUserController };
