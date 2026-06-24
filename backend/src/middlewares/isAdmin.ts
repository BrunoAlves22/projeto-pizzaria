import { Request, Response, NextFunction } from "express";
import prismaClient from "../prisma/index";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user_id;

  if (!user_id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "User is not an administrator" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { isAdmin };
