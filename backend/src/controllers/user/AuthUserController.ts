import { Request, Response } from "express";
import { AuthUserService } from "../../services/AuthUserService";

class AuthUserController {
  async handle(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const authUserService = new AuthUserService();

      const session = await authUserService.execute({ email, password });

      return res.status(200).json(session);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export { AuthUserController };
