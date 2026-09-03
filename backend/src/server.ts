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

// Atrás de um reverse proxy/load balancer o IP do cliente vem em
// X-Forwarded-For. Só confiar nele quando TRUST_PROXY estiver definido, com o
// número de saltos correto — confiar cegamente permitiria spoofing de IP e
// burlaria o rate limiting.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) {
  app.set(
    "trust proxy",
    /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === "true",
  );
}

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) =>
  origin.trim(),
);

if (!allowedOrigins) {
  console.warn(
    "[CORS] CORS_ORIGIN não definida — a API vai refletir a origem de qualquer requisição. Defina CORS_ORIGIN em produção.",
  );
}

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins ?? true,
  }),
);
app.use(generalLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(router);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
