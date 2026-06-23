import { NextFunction, Response, Request } from "express";
import { ZodError, ZodType } from "zod";

const validateSchema =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Error Validation",
          details: error.issues.map((issue) => ({
            field: issue.path.slice(1).join("."),
            message: issue.message,
          })),
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  };

export { validateSchema };
