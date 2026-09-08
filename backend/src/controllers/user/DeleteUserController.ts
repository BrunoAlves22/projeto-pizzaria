import { NextFunction, Request, Response } from "express";
import { DeleteUserService } from "../../services/user/DeleteUserService";

class DeleteUserController {
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = req.query;

      const deleteUserService = new DeleteUserService();
      const result = await deleteUserService.execute({
        userId: String(user_id),
        requesterId: req.user_id,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export { DeleteUserController };
