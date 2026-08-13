import { Request, Response, NextFunction } from "express";

function auditLog(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    console.log(
      JSON.stringify({
        type: "audit",
        timestamp: new Date().toISOString(),
        userId: req.user_id,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      }),
    );
  });

  return next();
}

export { auditLog };
