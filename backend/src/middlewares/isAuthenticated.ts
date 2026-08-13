import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import prismaClient from "../prisma/index";

interface Payload {
  sub: string;
  tokenVersion: number;
}

async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authToken.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const { sub, tokenVersion } = verify(
      token,
      process.env.JWT_SECRET as string,
      { algorithms: ["HS256"] },
    ) as Payload;

    const user = await prismaClient.user.findFirst({
      where: { id: sub },
      select: { tokenVersion: true },
    });

    if (!user || user.tokenVersion !== tokenVersion) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user_id = sub;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export { isAuthenticated };
