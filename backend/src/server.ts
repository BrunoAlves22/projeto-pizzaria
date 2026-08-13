import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { validateEnv } from "./config/env";
import { generalLimiter } from "./config/rateLimit";
import { errorHandler } from "./middlewares/errorHandler";
import { router } from "./routes";

validateEnv();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) =>
  origin.trim(),
);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins ?? true,
  }),
);
app.use(generalLimiter);
app.use(express.json());
app.use(router);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
