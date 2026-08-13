FROM node:20

# Pasta da aplicação
WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências (ci = instalação reprodutível a partir do lockfile)
RUN npm ci

# Copia o resto do projeto
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Usuário não-root para rodar a aplicação (home fora de /app para não
# vazar cache do npm/npx para o bind mount do host em desenvolvimento)
RUN groupadd --system appgroup \
  && useradd --system --gid appgroup --create-home --home-dir /home/appuser appuser \
  && chown -R appuser:appgroup /app
USER appuser

# Expõe a porta da API
EXPOSE 3333

# Comando para rodar (docker-compose.yml sobrescreve isso em desenvolvimento)
CMD ["npx", "tsx", "src/server.ts"]
