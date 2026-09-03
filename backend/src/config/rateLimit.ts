import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

/**
 * Limite das rotas de autenticação (`/session`).
 * - Chave = IP + e-mail: numa loja com vários dispositivos atrás do mesmo NAT,
 *   uma tentativa de brute force numa conta não bloqueia o login das demais.
 * - `skipSuccessfulRequests`: logins bem-sucedidos não contam, então o uso
 *   normal (errar a senha uma ou duas vezes) não trava o atendente.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip ?? "");
    const rawEmail = (req.body as { email?: unknown } | undefined)?.email;
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    return email ? `${ip}:${email}` : ip;
  },
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

export { generalLimiter, authLimiter };
