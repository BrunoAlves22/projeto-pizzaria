FROM node:20

# Pasta da aplicação
WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Expõe a porta da API
EXPOSE 3333

# Comando para rodar
CMD ["npm", "run", "dev"]