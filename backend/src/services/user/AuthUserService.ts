import { compare } from "bcryptjs";
import prismaClient from "../../prisma";
import { sign } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";

interface AuthUserServiceProps {
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthUserServiceProps) {
    const userExists = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (!userExists) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    const isPasswordValid = await compare(password, userExists.password);

    if (!isPasswordValid) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    const token = sign(
      {
        name: userExists.name,
        email: userExists.email,
      },
      process.env.JWT_SECRET as string,
      {
        subject: userExists.id,
        expiresIn: "1d",
      },
    );

    return {
      id: userExists.id,
      name: userExists.name,
      email: userExists.email,
      role: userExists.role,
      token,
    };
  }
}

export { AuthUserService };
