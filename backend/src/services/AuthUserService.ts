import { compare } from "bcryptjs";
import prismaClient from "../prisma/index";
import { sign } from "jsonwebtoken";

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
      throw new Error("E-mail ou senha incorretos");
    }

    const isPasswordValid = await compare(password, userExists.password);

    if (!isPasswordValid) {
      throw new Error("E-mail ou senha incorretos");
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
