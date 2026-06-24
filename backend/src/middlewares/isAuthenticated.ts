import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authToken.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const { sub } = verify(token, process.env.JWT_SECRET as string) as Payload;

    req.user_id = sub;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export { isAuthenticated };
