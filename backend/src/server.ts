console.log("Reiniciou");

import cors from "cors";
import "dotenv/config";
import express, { Response } from "express";
import { router } from "./routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);

app.use(
  (
    err: Error,
    req: express.Request,
    res: Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof Error) {
      return res.status(400).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
    });
  },
);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
