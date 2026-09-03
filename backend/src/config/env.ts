import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET deve ter no mínimo 16 caracteres"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME é obrigatória"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY é obrigatória"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET é obrigatória"),
  // Opcional. Definir quando a API estiver atrás de um reverse proxy / load
  // balancer (nginx, Cloudflare, etc.). Aceita um número (quantidade de saltos
  // confiáveis) ou "true". Sem isso, o rate limit por IP não distingue clientes
  // atrás do proxy.
  TRUST_PROXY: z
    .string()
    .regex(/^(true|false|\d+)$/, "TRUST_PROXY deve ser 'true', 'false' ou um número")
    .optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Variáveis de ambiente inválidas ou ausentes:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
}

export { validateEnv };
