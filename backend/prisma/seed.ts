import "dotenv/config";
import { hash } from "bcryptjs";
import prismaClient from "../src/prisma";

/**
 * Cria o primeiro usuário ADMIN a partir das variáveis de ambiente.
 * A rota `POST /users` é restrita a ADMIN, então este seed é o único jeito de
 * criar a conta inicial que depois provisiona as demais.
 *
 * Uso:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx prisma db seed
 * ou defina ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD no .env.
 *
 * Idempotente: se o e-mail já existir, não faz nada.
 */
async function main() {
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Seed abortado: defina ADMIN_EMAIL e ADMIN_PASSWORD (a senha precisa de 8+ caracteres, com maiúscula, minúscula e número).",
    );
    process.exit(1);
  }

  const strongEnough =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  if (!strongEnough) {
    console.error(
      "Seed abortado: ADMIN_PASSWORD fraca. Use 8+ caracteres com ao menos uma maiúscula, uma minúscula e um número.",
    );
    process.exit(1);
  }

  const existing = await prismaClient.user.findFirst({ where: { email } });

  if (existing) {
    console.log(`Usuário ${email} já existe (role: ${existing.role}). Nada a fazer.`);
    return;
  }

  const user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: await hash(password, 12),
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log("ADMIN criado com sucesso:", user);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro ao rodar o seed:", error);
    process.exit(1);
  });
