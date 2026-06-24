import { Request, Response } from "express";
import { DetailUserService } from "../../services/user/DetailUserService";

class DetailUserController {
  async handle(req: Request, res: Response) {
    try {
      const id = req.user_id;

      const detailUserService = new DetailUserService();

      const user = await detailUserService.execute({ id });

      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export { DetailUserController };
