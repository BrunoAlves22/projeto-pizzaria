import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const createUserService = new CreateUserService();

      const user = await createUserService.execute({
        name,
        email,
        password,
      });

      return res.status(201).json(user); // 👈 201
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message }); // 👈 400
      }

      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export { CreateUserController };
