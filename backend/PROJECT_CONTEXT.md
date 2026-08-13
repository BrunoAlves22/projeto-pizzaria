# Projeto Pizzaria — Backend: Documento de Contexto

## Sumário

1. [Arquitetura](#arquitetura)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Dependências e Versões](#dependências-e-versões)
4. [Configuração TypeScript](#configuração-typescript)
5. [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
6. [Endpoints da API](#endpoints-da-api)
7. [Middlewares](#middlewares)
8. [Validação com Zod (Schemas)](#validação-com-zod-schemas)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Autenticação e Autorização](#autenticação-e-autorização)
11. [Testes](#testes)
12. [Docker e Ambiente](#docker-e-ambiente)
13. [Segurança](#segurança)

---

## Arquitetura

O projeto segue uma arquitetura em camadas simples e direta:

```
Request HTTP
    │
    ▼
┌─────────────────────────────────────────────┐
│                   Middlewares                │
│   isAuthenticated ▸ isAdmin ▸ validateSchema │
└───────────────────────┬─────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │     Controller   │  ← recebe req, extrai dados, chama service
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │     Service      │  ← lógica de negócio + operação no banco
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  Prisma Client   │  ← acesso ao PostgreSQL
              └──────────────────┘
                       │
              (resultado / AppError)
                       │
                       ▼
              ┌──────────────────┐
              │   errorHandler   │  ← captura erros e formata a resposta
              └──────────────────┘
                       │
                       ▼
              Response HTTP (JSON)
```

**Fluxo resumido:**
- A rota aplica middlewares (autenticação, autorização, validação de schema) e delega ao **Controller**.
- O Controller extrai os dados da requisição e invoca o **Service**.
- O Service executa a lógica de negócio (verificações, hash de senha, geração de token, etc.) e acessa o banco via **Prisma Client**.
- Se ocorrer um erro de negócio, o Service lança um `AppError`; erros inesperados propagam como `Error`.
- O Controller captura qualquer exceção e repassa ao Express via `next(error)`.
- O `errorHandler` (middleware global) diferencia `AppError` de erros genéricos e retorna a resposta adequada.

---

## Estrutura de Pastas

```
backend/
├── Dockerfile
├── .env
├── .gitignore
├── .dockerignore
├── jest.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── tsconfig.test.json
├── prisma/
│   ├── migrations/             # Histórico de migrações do banco
│   └── schema.prisma           # Definição dos modelos e enum
└── src/
    ├── @types/
    │   └── express/
    │       └── index.d.ts      # Extensão do Request para incluir user_id
    ├── controllers/
    │   ├── user/
    │   │   ├── CreateUserController.ts
    │   │   ├── AuthUserController.ts
    │   │   ├── DetailUserController.ts
    │   │   ├── LogoutController.ts
    │   │   └── __tests__/
    │   │       ├── CreateUserController.spec.ts
    │   │       ├── AuthUserController.spec.ts
    │   │       ├── DetailUserController.spec.ts
    │   │       └── LogoutController.spec.ts
    │   ├── category/
    │   │   ├── CreateCategoryController.ts
    │   │   ├── ListCategoryController.ts
    │   │   └── __tests__/
    │   │       ├── CreateCategoryController.spec.ts
    │   │       └── ListCategoryController.spec.ts
    │   ├── products/
    │   │   ├── CreateProductController.ts
    │   │   ├── ListProductController.ts
    │   │   ├── ArchiveProductController.ts
    │   │   ├── DeleteProductController.ts
    │   │   ├── ListProductByCategoryController.ts
    │   │   └── __tests__/
    │   │       ├── CreateProductController.spec.ts
    │   │       ├── ListProductController.spec.ts
    │   │       └── ArchiveProductController.spec.ts
    │   └── order/
    │       ├── CreateOrderController.ts
    │       ├── ListOrderController.ts
    │       ├── AddItemOrderController.ts
    │       ├── RemoveItemOrderController.ts
    │       ├── DetailOrderController.ts
    │       ├── SendOrderController.ts
    │       ├── FinishOrderController.ts
    │       ├── DeleteOrderController.ts
    │       └── __tests__/
    │           ├── CreateOrderController.spec.ts
    │           ├── ListOrderController.spec.ts
    │           ├── AddItemOrderController.spec.ts
    │           ├── RemoveItemOrderController.spec.ts
    │           ├── DetailOrderController.spec.ts
    │           ├── SendOrderController.spec.ts
    │           ├── FinishOrderController.spec.ts
    │           └── DeleteOrderController.spec.ts
    ├── services/
    │   ├── user/
    │   │   ├── CreateUserService.ts
    │   │   ├── AuthUserService.ts
    │   │   ├── DetailUserService.ts
    │   │   ├── LogoutService.ts
    │   │   └── __tests__/
    │   │       ├── CreateUserService.spec.ts
    │   │       ├── AuthUserService.spec.ts
    │   │       ├── DetailUserService.spec.ts
    │   │       └── LogoutService.spec.ts
    │   ├── category/
    │   │   ├── CreateCategoryService.ts
    │   │   ├── ListCategoryService.ts
    │   │   └── __tests__/
    │   │       ├── CreateCategoryService.spec.ts
    │   │       └── ListCategoryService.spec.ts
    │   ├── products/
    │   │   ├── CreateProductService.ts
    │   │   ├── ListProductService.ts
    │   │   ├── ArchiveProductService.ts
    │   │   ├── DeleteProductService.ts
    │   │   ├── ListProductByCategoryService.ts
    │   │   └── __tests__/
    │   │       ├── CreateProductService.spec.ts
    │   │       ├── ListProductService.spec.ts
    │   │       └── ArchiveProductService.spec.ts
    │   └── order/
    │       ├── CreateOrderService.ts
    │       ├── ListOrderService.ts
    │       ├── AddItemOrderService.ts
    │       ├── RemoveItemOrderService.ts
    │       ├── DetailOrderService.ts
    │       ├── SendOrderService.ts
    │       ├── FinishOrderService.ts
    │       ├── DeleteOrderService.ts
    │       └── __tests__/
    │           ├── CreateOrderService.spec.ts
    │           ├── ListOrderService.spec.ts
    │           ├── AddItemOrderService.spec.ts
    │           ├── RemoveItemOrderService.spec.ts
    │           ├── DetailOrderService.spec.ts
    │           ├── SendOrderService.spec.ts
    │           ├── FinishOrderService.spec.ts
    │           └── DeleteOrderService.spec.ts
    ├── config/
    │   ├── multer.ts            # Configuração de upload (memoryStorage, filtro de mimetype, limite 5MB)
    │   ├── cloudinary.ts        # Configuração do client Cloudinary (v2)
    │   ├── env.ts               # Validação (Zod) das env vars obrigatórias no startup
    │   └── rateLimit.ts         # Limiters (geral e de autenticação) do express-rate-limit
    ├── middlewares/
    │   ├── errorHandler.ts     # Middleware global de erros
    │   ├── isAuthenticated.ts  # Validação do JWT + checagem de tokenVersion no banco
    │   ├── isAdmin.ts          # Verificação de role ADMIN
    │   ├── validateSchema.ts   # Validação de body/query/params com Zod
    │   ├── auditLog.ts         # Log estruturado de ações em rotas ADMIN
    │   └── __tests__/
    │       └── isAuthenticated.spec.ts
    ├── schemas/
    │   ├── userSchema.ts       # Schemas Zod para rotas de usuário
    │   ├── categorySchema.ts   # Schema Zod para rota de categoria
    │   ├── productSchema.ts   # Schemas Zod para rotas de produto
    │   └── orderSchema.ts      # Schemas Zod para rotas de pedido
    ├── errors/
    │   └── AppError.ts         # Classe de erro customizada
    ├── prisma/
    │   └── index.ts            # Instância singleton do PrismaClient
    ├── routes.ts               # Definição das rotas
    ├── server.ts               # Bootstrap da aplicação Express
    └── generated/
        └── prisma/             # Client gerado automaticamente pelo Prisma
```

---

## Dependências e Versões

### Produção

| Pacote | Versão | Finalidade |
|---|---|---|
| `express` | `^5.2.1` | Framework HTTP |
| `@prisma/client` | `^7.6.0` | ORM — acesso ao banco |
| `@prisma/adapter-pg` | `^7.6.0` | Adapter PostgreSQL para Prisma |
| `pg` | `^8.20.0` | Driver PostgreSQL |
| `jsonwebtoken` | `^9.0.3` | Geração e verificação de JWT |
| `bcryptjs` | `^3.0.3` | Hash de senhas |
| `zod` | `^4.3.6` | Validação de schemas |
| `cors` | `^2.8.6` | Middleware CORS |
| `dotenv` | `^17.4.1` | Carregamento de variáveis de ambiente |
| `tsx` | `^4.21.0` | Execução de TypeScript sem build |
| `multer` | `^2.2.0` | Upload de arquivos (multipart/form-data) em memória |
| `cloudinary` | `^2.10.0` | SDK para upload/armazenamento de imagens (banner de produto) |
| `helmet` | `^8.3.0` | Headers de segurança HTTP (HSTS, X-Content-Type-Options, etc.) |
| `express-rate-limit` | `^8.6.2` | Rate limiting (geral + rotas de autenticação) |

### Desenvolvimento

| Pacote | Versão | Finalidade |
|---|---|---|
| `typescript` | `^6.0.2` | Compilador TypeScript |
| `prisma` | `^7.6.0` | CLI do Prisma (migrations, generate) |
| `jest` | `^29.7.0` | Framework de testes |
| `ts-jest` | `^29.4.9` | Preset Jest para TypeScript |
| `supertest` | `^7.2.2` | Testes de integração HTTP |
| `nodemon` | `^3.1.14` | Hot reload em desenvolvimento |
| `@types/express` | `^5.0.6` | Tipos Express |
| `@types/jsonwebtoken` | `^9.0.10` | Tipos JWT |
| `@types/bcryptjs` | — | Tipos bcryptjs |
| `@types/jest` | `^29.5.14` | Tipos Jest |
| `@types/supertest` | `^7.2.0` | Tipos supertest |
| `@types/cors` | `^2.8.19` | Tipos CORS |
| `@types/node` | `^25.5.2` | Tipos Node.js |
| `@types/pg` | `^8.20.0` | Tipos driver PG |
| `@types/multer` | `^2.2.0` | Tipos multer |
| `ts-node` | `^10.9.2` | Execução de TS para scripts |

### Scripts disponíveis

```bash
npm run dev           # Desenvolvimento com hot reload (nodemon + tsx)
npm run test          # Roda todos os testes uma vez
npm run test:watch    # Modo watch — re-roda ao salvar
npm run test:coverage # Relatório de cobertura
npm run test:verbose  # Saída detalhada dos testes
```

---

## Configuração TypeScript

**`tsconfig.json`** — configuração principal (exclui arquivos de teste):

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",

    // Strict completo
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Qualidade adicional
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts", "**/*.test.ts", "dist"]
}
```

**`tsconfig.test.json`** — herda o principal e inclui os arquivos de teste.

---

## Modelagem do Banco de Dados

**Banco:** PostgreSQL  
**ORM:** Prisma 7 com adapter `@prisma/adapter-pg`

### Diagrama de Entidades

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Category   │       │   Product    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (uuid PK) │       │ id (uuid PK) │       │ id (uuid PK) │
│ name         │       │ name         │◄──────│ categoryId   │
│ email unique │       │ createdAt    │       │ name         │
│ password     │       │ updatedAt    │       │ description  │
│ role (enum)  │       └──────────────┘       │ price (Int)  │
│ tokenVersion │                              │ banner       │
│ createdAt    │                              │ disabled     │
│ updatedAt    │                              │ createdAt    │
                                              │ updatedAt    │
                                              └──────┬───────┘
                                                     │
                    ┌──────────────┐           ┌─────▼──────────┐
                    │    Order     │           │   OrderItem    │
                    ├──────────────┤           ├────────────────┤
                    │ id (uuid PK) │◄──────────│ orderId        │
                    │ table (Int)  │           │ productId      │
                    │ status (Bool)│           │ amount (Int)   │
                    │ draft (Bool) │           │ id (uuid PK)   │
                    │ name         │           │ createdAt      │
                    │ createdAt    │           │ updatedAt      │
                    │ updatedAt    │           └────────────────┘
                    └──────────────┘
```

### Enum

```prisma
enum Role {
  STAFF   // padrão — atendentes
  ADMIN   // administradores com acesso total
}
```

### Modelos

#### User (`users`)

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | String (uuid) | PK, auto-gerado |
| `name` | String | — |
| `email` | String | unique |
| `password` | String | hash bcrypt (custo 12) |
| `role` | Role (enum) | default: `STAFF` |
| `tokenVersion` | Int | default: `0` — incrementado em `/logout` para revogar tokens JWT emitidos anteriormente |
| `createdAt` | DateTime | auto: `now()` |
| `updatedAt` | DateTime | auto: `updatedAt` |

#### Category (`categories`)

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | String (uuid) | PK, auto-gerado |
| `name` | String | — |
| `createdAt` | DateTime | auto: `now()` |
| `updatedAt` | DateTime | auto: `updatedAt` |

Relação: `Category 1 ── N Product`

#### Product (`products`)

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | String (uuid) | PK, auto-gerado |
| `name` | String | — |
| `description` | String | — |
| `price` | Int | valor em centavos |
| `banner` | String | URL/path da imagem |
| `disabled` | Boolean | default: `false` |
| `categoryId` | String | FK → Category, onDelete: Cascade |
| `createdAt` | DateTime | auto: `now()` |
| `updatedAt` | DateTime | auto: `updatedAt` |

Relações: `Product N ── 1 Category` | `Product 1 ── N OrderItem`

#### Order (`orders`)

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | String (uuid) | PK, auto-gerado |
| `table` | Int | número da mesa |
| `status` | Boolean | default: `false` (pendente) |
| `draft` | Boolean | default: `true` (rascunho) |
| `name` | String | nome do cliente/pedido |
| `createdAt` | DateTime | auto: `now()` |
| `updatedAt` | DateTime | auto: `updatedAt` |

Relação: `Order 1 ── N OrderItem`

#### OrderItem (`order_items`)

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | String (uuid) | PK, auto-gerado |
| `orderId` | String | FK → Order, onDelete: Cascade |
| `productId` | String | FK → Product, onDelete: Cascade |
| `amount` | Int | quantidade do produto |
| `createdAt` | DateTime | auto: `now()` |
| `updatedAt` | DateTime | auto: `updatedAt` |

---

## Endpoints da API

**Base URL:** `http://localhost:3333`

### Referência rápida

| Método | Rota | Auth? | Admin? | Schema |
|---|---|---|---|---|
| `POST` | `/users` | Não | Não | `createUserSchema` |
| `POST` | `/session` | Não | Não | `authUserSchema` |
| `GET` | `/me` | Sim | Não | — |
| `POST` | `/logout` | Sim | Não | — |
| `POST` | `/category` | Sim | Sim | `createCategorySchema` |
| `GET` | `/category-list` | Sim | Não | — |
| `POST` | `/product` | Sim | Sim | `createProductSchema` (+ upload `file`) |
| `GET` | `/products` | Sim | Não | `listProductSchema` |
| `PATCH` | `/product` | Sim | Sim | `archiveProductSchema` |
| `DELETE` | `/product` | Sim | Sim | `deleteProductSchema` |
| `GET` | `/category/product` | Sim | Não | `listProductByCategorySchema` |
| `POST` | `/order` | Sim | Não | `createOrderSchema` |
| `GET` | `/orders` | Sim | Não | `listOrderSchema` |
| `POST` | `/order/add` | Sim | Não | `addItemOrderSchema` |
| `DELETE` | `/order/remove` | Sim | Não | `removeItemOrderSchema` |
| `GET` | `/order/detail` | Sim | Não | `detailOrderSchema` |
| `PUT` | `/order/send` | Sim | Não | `sendOrderSchema` |
| `PUT` | `/order/finish` | Sim | Não | `finishOrderSchema` |
| `DELETE` | `/order/delete` | Sim | Não | `deleteOrderSchema` |

> As rotas de pedido não exigem role `ADMIN` — qualquer usuário autenticado (`isAuthenticated`) pode criar, listar, editar itens, enviar para a cozinha, finalizar ou deletar pedidos.

> `/users` e `/session` têm rate limit dedicado (`authLimiter` — 10 requisições / 15 min por IP); todas as rotas têm rate limit geral (`generalLimiter` — 300 requisições / 15 min por IP). Ver [Segurança](#segurança).

---

### `POST /users` — Criar usuário

**Middlewares:** `authLimiter` → `validateSchema(createUserSchema)`

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123"
}
```

Senha: mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula e 1 número.

**Resposta 201:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "STAFF",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — validação falhou (campos inválidos)
- `409` — e-mail já cadastrado
- `429` — muitas requisições (rate limit de `authLimiter`)

---

### `POST /session` — Autenticar usuário

**Middlewares:** `authLimiter` → `validateSchema(authUserSchema)`

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "STAFF",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Erros:**
- `400` — validação falhou
- `401` — e-mail ou senha incorretos
- `429` — muitas requisições (rate limit de `authLimiter`)

---

### `GET /me` — Detalhes do usuário autenticado

**Middlewares:** `isAuthenticated`  
**Header:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `401` — token não fornecido ou inválido
- `404` — usuário não encontrado

---

### `POST /logout` — Encerrar sessões do usuário

**Middlewares:** `isAuthenticated`  
**Header:** `Authorization: Bearer <token>`

Incrementa `tokenVersion` do usuário no banco. Como `isAuthenticated` compara o `tokenVersion` do payload do JWT com o valor atual no banco a cada requisição, **todos** os tokens emitidos antes da chamada — inclusive o usado na própria chamada — passam a ser rejeitados (`401`), mesmo dentro do prazo de expiração (`1d`). É o mecanismo de revogação de sessão do projeto (ver [Segurança](#segurança)).

**Resposta 200:**
```json
{
  "message": "Sessões encerradas com sucesso"
}
```

**Erros:**
- `401` — não autenticado

---

### `POST /category` — Criar categoria

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(createCategorySchema)`  
**Header:** `Authorization: Bearer <token>` (usuário com role `ADMIN`)

**Body:**
```json
{
  "name": "Pizzas"
}
```

**Resposta 201:**
```json
{
  "id": "uuid",
  "name": "Pizzas",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — nome da categoria vazio
- `401` — não autenticado
- `403` — usuário não é ADMIN

---

### `GET /category-list` — Listar categorias

**Middlewares:** `isAuthenticated`  
**Header:** `Authorization: Bearer <token>`

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Pizzas",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

Categorias ordenadas por `name` (asc). Não exige role `ADMIN` — qualquer usuário autenticado pode listar.

**Erros:**
- `401` — não autenticado

---

### `POST /product` — Criar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `upload.single("file")` (multer) → `validateSchema(createProductSchema)`  
**Header:** `Authorization: Bearer <token>` (usuário com role `ADMIN`)  
**Content-Type:** `multipart/form-data`

**Campos do form-data:**
```
name: string          (obrigatório)
description: string   (obrigatório)
price: string         (obrigatório, somente dígitos — ex.: "4500" para R$ 45,00 em centavos)
categoryId: string    (obrigatório, deve existir em Category)
file: <arquivo>        (obrigatório, JPEG/PNG/JPG, máx. 5MB)
```

**Fluxo:**
1. `multer` valida mimetype (`image/jpeg`, `image/png`, `image/jpg`) e tamanho (máx. 5MB), armazenando o buffer em memória (`req.file.buffer`).
2. `validateSchema(createProductSchema)` valida os campos de texto do `body`.
3. O Controller verifica se `req.file` existe; caso contrário, lança `AppError("Nenhum arquivo enviado", 400)`.
4. O `CreateProductService` verifica se a `categoryId` existe (senão `AppError("Categoria não encontrada", 404)`).
5. Faz upload do buffer da imagem para o Cloudinary (pasta `pizzaria`, `public_id` com timestamp + nome do arquivo sanitizado — remove acentos e caracteres fora de `[a-zA-Z0-9_-]`) via stream; falha no upload gera `AppError(502)`.
6. Cria o produto no banco com a `secure_url` retornada como `banner`.

**Resposta 201:**
```json
{
  "id": "uuid",
  "name": "Pizza Calabresa",
  "description": "Molho, mussarela e calabresa",
  "price": 4500,
  "banner": "https://res.cloudinary.com/.../pizzaria/....jpg",
  "categoryId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — validação do schema falhou, ou nenhum arquivo enviado
- `401` — não autenticado
- `403` — usuário não é ADMIN
- `404` — categoria não encontrada
- `502` — falha no upload para o Cloudinary
- `500` — arquivo com mimetype não permitido (erro do `multer` não tratado como `AppError`) ou erro inesperado

---

### `GET /products` — Listar produtos

**Middlewares:** `isAuthenticated` → `validateSchema(listProductSchema)`  
**Header:** `Authorization: Bearer <token>`

**Query params:**
```
disabled: "true" | "false"   (opcional — padrão: "false")
```

**Exemplos:**
```
GET /products               → filtra disabled = false
GET /products?disabled=false → filtra disabled = false
GET /products?disabled=true  → filtra disabled = true
```

O Controller lê `req.query.disabled` e converte para boolean com `=== "true"`; qualquer valor diferente de `"true"` (incluindo ausência do parâmetro) resulta em `disabled = false`. O schema apenas garante que, se enviado, o valor seja exatamente `"true"` ou `"false"`.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Pizza Calabresa",
    "description": "Molho, mussarela e calabresa",
    "price": 4500,
    "banner": "https://res.cloudinary.com/.../pizzaria/....jpg",
    "disabled": false,
    "categoryId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

Produtos ordenados por `name` (asc). Não exige role `ADMIN` — qualquer usuário autenticado pode listar.

**Erros:**
- `400` — valor de `disabled` inválido (diferente de `"true"`/`"false"`)
- `401` — não autenticado

---

### `PATCH /product` — Arquivar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(archiveProductSchema)`  
**Header:** `Authorization: Bearer <token>` (usuário com role `ADMIN`)

**Query params:**
```
product_id: string   (obrigatório)
```

**Fluxo:** o `ArchiveProductService` verifica se o produto existe (`findFirst`); se não existir, lança `AppError("Produto não encontrado", 404)`. Caso exista, atualiza `disabled: true`.

**Resposta 200:**
```json
{
  "message": "Produto arquivado com sucesso"
}
```

**Erros:**
- `400` — `product_id` não enviado
- `401` — não autenticado
- `403` — usuário não é ADMIN
- `404` — produto não encontrado

---

### `DELETE /product` — Deletar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(deleteProductSchema)`  
**Header:** `Authorization: Bearer <token>` (usuário com role `ADMIN`)

**Query params:**
```
product_id: string   (obrigatório)
```

**Fluxo:** o `DeleteProductService` verifica se o produto existe (`findFirst`); se não existir, lança `AppError("Produto não encontrado", 404)`. Caso exista, remove o produto do banco.

**Resposta 200:**
```json
{
  "message": "Produto deletado com sucesso"
}
```

**Erros:**
- `400` — `product_id` não enviado
- `401` — não autenticado
- `403` — usuário não é ADMIN
- `404` — produto não encontrado

---

### `GET /category/product` — Listar produtos de uma categoria

**Middlewares:** `isAuthenticated` → `validateSchema(listProductByCategorySchema)`  
**Header:** `Authorization: Bearer <token>`

**Query params:**
```
category_id: string   (obrigatório, deve existir em Category)
```

**Fluxo:** o `ListProductByCategoryService` verifica se a categoria existe (`AppError("Categoria não encontrada", 404)`) e retorna apenas os produtos não desabilitados (`disabled: false`) dessa categoria, ordenados por `name` (asc).

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Pizza Calabresa",
    "description": "Molho, mussarela e calabresa",
    "price": 4500,
    "banner": "https://res.cloudinary.com/.../pizzaria/....jpg",
    "disabled": false,
    "categoryId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

Não exige role `ADMIN` — qualquer usuário autenticado pode listar.

**Erros:**
- `400` — `category_id` não enviado
- `401` — não autenticado
- `404` — categoria não encontrada

---

### Fluxo de pedidos

Fluxo típico de um pedido: `POST /order` (criado como rascunho, `draft: true`) → `POST /order/add` (adiciona itens) → `DELETE /order/remove` (remove item, se necessário) → `PUT /order/send` (envia para a cozinha, `draft: false`) → `PUT /order/finish` (finaliza, `status: true`). `DELETE /order/delete` pode ser usado em qualquer etapa para cancelar o pedido.

### `POST /order` — Criar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(createOrderSchema)`

**Body:**
```json
{
  "table": 5,
  "name": "João Silva"
}
```

**Fluxo:** o `CreateOrderService` cria o pedido diretamente, sem verificações adicionais — `draft` e `status` assumem os defaults do banco (`true` e `false`, respectivamente).

**Resposta 201:**
```json
{
  "id": "uuid",
  "table": 5,
  "name": "João Silva",
  "status": false,
  "draft": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — `table` ou `name` inválidos/ausentes
- `401` — não autenticado

---

### `GET /orders` — Listar pedidos

**Middlewares:** `isAuthenticated` → `validateSchema(listOrderSchema)`

**Query params:**
```
draft: "true" | "false"   (opcional)
```

O Controller lê `req.query.draft` e repassa como `string` ao Service, que converte com `draft === "true"`; qualquer valor diferente de `"true"` (incluindo ausência do parâmetro) resulta em `draft = false` no filtro.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "table": 5,
    "name": "João Silva",
    "draft": true,
    "status": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "orderItems": [
      {
        "id": "uuid",
        "amount": 2,
        "product": {
          "id": "uuid",
          "name": "Pizza Calabresa",
          "description": "Molho, mussarela e calabresa",
          "price": 4500,
          "banner": "https://res.cloudinary.com/.../pizzaria/....jpg"
        }
      }
    ]
  }
]
```

**Erros:**
- `400` — valor de `draft` inválido (diferente de `"true"`/`"false"`)
- `401` — não autenticado

---

### `POST /order/add` — Adicionar item ao pedido

**Middlewares:** `isAuthenticated` → `validateSchema(addItemOrderSchema)`

**Body:**
```json
{
  "orderId": "uuid",
  "productId": "uuid",
  "amount": 2
}
```

**Fluxo:** o `AddItemOrderService` verifica se o pedido existe (`AppError("Pedido não encontrado", 404)`), depois se o produto existe e não está desabilitado (`AppError("Produto não encontrado", 404)`); só então cria o `OrderItem`.

**Resposta 201:**
```json
{
  "id": "uuid",
  "amount": 2,
  "orderId": "uuid",
  "productId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "product": {
    "id": "uuid",
    "name": "Pizza Calabresa",
    "price": 4500,
    "description": "Molho, mussarela e calabresa",
    "banner": "https://res.cloudinary.com/.../pizzaria/....jpg"
  }
}
```

**Erros:**
- `400` — campos inválidos/ausentes
- `401` — não autenticado
- `404` — pedido não encontrado ou produto não encontrado

---

### `DELETE /order/remove` — Remover item do pedido

**Middlewares:** `isAuthenticated` → `validateSchema(removeItemOrderSchema)`

**Query params:**
```
itemId: string   (obrigatório)
```

**Fluxo:** o `RemoveItemOrderService` verifica se o item existe (`AppError("Item não encontrado", 404)`) e o remove.

**Resposta 200:**
```json
{
  "message": "Item deletado com sucesso"
}
```

**Erros:**
- `400` — `itemId` não enviado
- `401` — não autenticado
- `404` — item não encontrado

---

### `GET /order/detail` — Detalhar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(detailOrderSchema)`

**Query params:**
```
orderId: string   (obrigatório)
```

**Resposta 200:**
```json
{
  "id": "uuid",
  "table": 5,
  "name": "João Silva",
  "draft": true,
  "status": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "orderItems": [
    {
      "id": "uuid",
      "amount": 2,
      "product": {
        "id": "uuid",
        "name": "Pizza Calabresa",
        "description": "Molho, mussarela e calabresa",
        "price": 4500,
        "banner": "https://res.cloudinary.com/.../pizzaria/....jpg"
      }
    }
  ]
}
```

**Erros:**
- `400` — `orderId` não enviado
- `401` — não autenticado
- `404` — pedido não encontrado

---

### `PUT /order/send` — Enviar pedido para a cozinha

**Middlewares:** `isAuthenticated` → `validateSchema(sendOrderSchema)`

**Body:**
```json
{
  "name": "João Silva",
  "orderId": "uuid"
}
```

**Fluxo:** o `SendOrderService` verifica se o pedido existe (`AppError("Pedido não encontrado", 404)`) e atualiza `draft: false` e `name`.

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "draft": false,
  "table": 5,
  "status": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — `name` ou `orderId` inválidos/ausentes
- `401` — não autenticado
- `404` — pedido não encontrado

---

### `PUT /order/finish` — Finalizar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(finishOrderSchema)`

**Body:**
```json
{
  "orderId": "uuid"
}
```

**Fluxo:** o `FinishOrderService` verifica se o pedido existe (`AppError("Pedido não encontrado", 404)`) e atualiza `status: true`.

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "draft": false,
  "table": 5,
  "status": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:**
- `400` — `orderId` inválido/ausente
- `401` — não autenticado
- `404` — pedido não encontrado

---

### `DELETE /order/delete` — Deletar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(deleteOrderSchema)`

**Query params:**
```
orderId: string   (obrigatório)
```

**Fluxo:** o `DeleteOrderService` verifica se o pedido existe (`AppError("Pedido não encontrado", 404)`) e o remove (cascata remove também os `OrderItem` associados, conforme `onDelete: Cascade`).

**Resposta 200:**
```json
{
  "message": "Pedido deletado com sucesso"
}
```

**Erros:**
- `400` — `orderId` não enviado
- `401` — não autenticado
- `404` — pedido não encontrado

---

## Middlewares

### `isAuthenticated`

**Arquivo:** [src/middlewares/isAuthenticated.ts](src/middlewares/isAuthenticated.ts)

Valida o JWT enviado no header `Authorization: Bearer <token>` e confere se a sessão não foi revogada.  
Em caso de sucesso, injeta `req.user_id` (extraído do `sub` do token) e chama `next()`.

```
Header Authorization presente?
  Não → 401 "Token não fornecido"
  Sim → extrai token após "Bearer "
         Token presente?
           Não → 401
           Sim → verify(token, JWT_SECRET, { algorithms: ["HS256"] })
                  Inválido/expirado? → 401 "Token inválido"
                  Válido? → busca user no banco (select tokenVersion)
                             user existe e tokenVersion (banco) === tokenVersion (payload)?
                               Não → 401 "Token inválido" (sessão revogada via /logout ou usuário removido)
                               Sim → req.user_id = sub → next()
```

> A checagem de `tokenVersion` adiciona uma consulta ao banco por requisição autenticada (mesmo custo que `isAdmin` já tinha) em troca de revogação real de sessão — ver [Segurança](#segurança).

---

### `isAdmin`

**Arquivo:** [src/middlewares/isAdmin.ts](src/middlewares/isAdmin.ts)

Deve ser usado **após** `isAuthenticated`. Consulta o banco para verificar se o usuário tem `role === "ADMIN"`.

```
req.user_id presente?
  Não → 401 "User not authenticated"
  Sim → busca user no banco
         Encontrou e role = ADMIN? → next()
         Não encontrou ou role ≠ ADMIN → 403 "User is not an administrator"
         Erro inesperado → 500
```

---

### `validateSchema`

**Arquivo:** [src/middlewares/validateSchema.ts](src/middlewares/validateSchema.ts)

Recebe um schema Zod e valida `{ body, query, params }` da requisição.

```
schema.parseAsync({ body, query, params })
  OK → next()
  ZodError → 400 com array de erros formatados
              [{ field: "body.email", message: "Email inválido" }]
  Outro erro → 500
```

---

### `auditLog`

**Arquivo:** [src/middlewares/auditLog.ts](src/middlewares/auditLog.ts)

Aplicado após `isAdmin` nas rotas administrativas (`POST /category`, `POST /product`, `PATCH /product`, `DELETE /product`). No evento `finish` da response, loga uma linha JSON estruturada no stdout com `userId`, `method`, `path` e `statusCode` — não loga corpo da requisição nem dados sensíveis.

```json
{"type":"audit","timestamp":"...","userId":"uuid","method":"POST","path":"/category","statusCode":201}
```

---

### `errorHandler`

**Arquivo:** [src/middlewares/errorHandler.ts](src/middlewares/errorHandler.ts)

Middleware global de erros (4 parâmetros — `err, req, res, next`), registrado **após** as rotas em `server.ts`.

```
err instanceof AppError?
  Sim → res.status(err.statusCode).json({ message: err.message })
  Não → console.error(err) + res.status(500).json({ message: "Erro interno do servidor" })
```

---

## Validação com Zod (Schemas)

Os schemas envolvem sempre o objeto de validação em `{ body: z.object({...}) }` para que o middleware `validateSchema` possa mapear a origem do campo corretamente.

### `createUserSchema`

**Arquivo:** [src/schemas/userSchema.ts](src/schemas/userSchema.ts)

```typescript
z.object({
  body: z.object({
    name: z.string({ error: "Nome inválido" }),
    email: z.email({ error: "Email inválido" }),
    password: z
      .string({ error: "Senha é obrigatória" })
      .min(8, { error: "Senha tem que conter 8 caracteres no mínimo" })
      .regex(/[a-z]/, { error: "Senha deve conter ao menos uma letra minúscula" })
      .regex(/[A-Z]/, { error: "Senha deve conter ao menos uma letra maiúscula" })
      .regex(/[0-9]/, { error: "Senha deve conter ao menos um número" }),
  }),
})
```

### `authUserSchema`

**Arquivo:** [src/schemas/userSchema.ts](src/schemas/userSchema.ts)

```typescript
z.object({
  body: z.object({
    email: z.string({ error: "Email inválido" }),
    password: z.string({ error: "Senha é obrigatória" }),
  }),
})
```

### `createCategorySchema`

**Arquivo:** [src/schemas/categorySchema.ts](src/schemas/categorySchema.ts)

```typescript
z.object({
  body: z.object({
    name: z.string().min(1, { message: "O nome da categoria é obrigatório" }),
  }),
})
```

### `createProductSchema`

**Arquivo:** [src/schemas/productSchema.ts](src/schemas/productSchema.ts)

```typescript
z.object({
  body: z.object({
    name: z.string().min(1, { error: "O nome do produto é obrigatório" }),
    description: z
      .string()
      .min(1, { error: "A descrição do produto é obrigatória" }),
    price: z
      .string()
      .min(1, { error: "O preço do produto é obrigatório" })
      .regex(/^\d+$/, { error: "O preço do produto deve ser um número" }),
    categoryId: z.string().min(1, { error: "O ID da categoria é obrigatório" }),
  }),
})
```

`price` chega como `string` (form-data) e é validado por regex antes de ser convertido para `Int` (`parseInt`) no Controller.

### `listProductSchema`

**Arquivo:** [src/schemas/productSchema.ts](src/schemas/productSchema.ts)

```typescript
z.object({
  query: z.object({
    disabled: z
      .enum(["true", "false"], {
        error: "O parâmetro disabled deve ser 'true' ou 'false'",
      })
      .optional(),
  }),
})
```

Valida apenas o formato do query param; a conversão para `boolean` e o valor padrão (`false`) ficam a cargo do Controller (`req.query.disabled === "true"`).

### `archiveProductSchema`

**Arquivo:** [src/schemas/productSchema.ts](src/schemas/productSchema.ts)

```typescript
z.object({
  query: z.object({
    product_id: z.string().min(1, { error: "O ID do produto é obrigatório" }),
  }),
})
```

### `deleteProductSchema`

**Arquivo:** [src/schemas/productSchema.ts](src/schemas/productSchema.ts)

```typescript
z.object({
  query: z.object({
    product_id: z.string().min(1, { error: "O ID do produto é obrigatório" }),
  }),
})
```

### `listProductByCategorySchema`

**Arquivo:** [src/schemas/productSchema.ts](src/schemas/productSchema.ts)

```typescript
z.object({
  query: z.object({
    category_id: z.string().min(1, { error: "O ID da categoria é obrigatório" }),
  }),
})
```

### `createOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  body: z.object({
    table: z
      .number({ error: "O número da mesa é obrigatório" })
      .int({ error: "O número da mesa deve ser um número inteiro" })
      .positive({ error: "O número da mesa deve ser positivo" }),
    name: z.string().min(1, { error: "O nome do cliente é obrigatório" }),
  }),
})
```

### `listOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  query: z.object({
    draft: z
      .enum(["true", "false"], { error: "Erro ao validar o parâmetro draft" })
      .optional(),
  }),
})
```

### `addItemOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  body: z.object({
    orderId: z.string({ error: "O ID do pedido é obrigatório" }),
    productId: z.string({ error: "O ID do produto é obrigatório" }),
    amount: z
      .number({ error: "A quantidade é obrigatória" })
      .int({ error: "A quantidade deve ser um número inteiro" })
      .positive({ error: "A quantidade deve ser positiva" }),
  }),
})
```

### `removeItemOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  query: z.object({
    itemId: z.string().min(1, { error: "O ID do item é obrigatório" }),
  }),
})
```

### `detailOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  query: z.object({
    orderId: z.string().min(1, { error: "O ID do pedido é obrigatório" }),
  }),
})
```

### `sendOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  body: z.object({
    name: z.string().min(1, { error: "O nome do cliente é obrigatório" }),
    orderId: z.string().min(1, { error: "O ID do pedido é obrigatório" }),
  }),
})
```

### `finishOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  body: z.object({
    orderId: z.string().min(1, { error: "O ID do pedido é obrigatório" }),
  }),
})
```

### `deleteOrderSchema`

**Arquivo:** [src/schemas/orderSchema.ts](src/schemas/orderSchema.ts)

```typescript
z.object({
  query: z.object({
    orderId: z.string().min(1, { error: "O ID do pedido é obrigatório" }),
  }),
})
```

**Formato de erro retornado ao cliente:**
```json
{
  "error": "Error Validation",
  "details": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "Senha tem que conter 8 caracteres no mínimo" }
  ]
}
```

---

## Tratamento de Erros

### `AppError`

**Arquivo:** [src/errors/AppError.ts](src/errors/AppError.ts)

```typescript
class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
  ) { ... }
}
```

Usada nos Services para erros de negócio previsíveis. O `errorHandler` captura e retorna o `statusCode` correto.

### Tabela de códigos de erro usados

| Código | Quando |
|---|---|
| `400` | Validação de schema (Zod) |
| `401` | Não autenticado / credenciais inválidas |
| `403` | Autenticado mas sem permissão (não é ADMIN) |
| `404` | Recurso não encontrado |
| `409` | Conflito (e-mail já existe) |
| `429` | Rate limit excedido (`generalLimiter` global ou `authLimiter` em `/session` e `/users`) |
| `500` | Erro inesperado do servidor |
| `502` | Falha ao integrar com serviço externo (upload de imagem no Cloudinary) |

---

## Autenticação e Autorização

**Tipo:** JWT (Bearer Token)  
**Biblioteca:** `jsonwebtoken` 9.0.3  
**Algoritmo:** `HS256`, fixado explicitamente em `sign()` e `verify()` (evita ataques de confusão de algoritmo)  
**Secret:** variável de ambiente `JWT_SECRET` (validada no startup — ver [Segurança](#segurança))  
**Expiração:** `1d` (1 dia)  
**Revogação:** via `tokenVersion` — ver [`POST /logout`](#post-logout--encerrar-sessões-do-usuário)

**Payload do token:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "tokenVersion": 0,
  "sub": "<user_id>",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Extensão do tipo Request:**

```typescript
// src/@types/express/index.d.ts
declare namespace Express {
  export interface Request {
    user_id: string;
  }
}
```

**Roles disponíveis:**
- `STAFF` — usuário padrão (criado por default)
- `ADMIN` — acesso a rotas administrativas (como criação de categorias)

---

## Testes

**Framework:** Jest 29 + ts-jest + supertest  
**Configuração:** [jest.config.ts](jest.config.ts) + [tsconfig.test.json](tsconfig.test.json)

**Localização:** `__tests__/` dentro de cada módulo (controller ou service)

**Convenção:** `*.spec.ts`

**Cobertura configurada:**
```
src/**/*.ts
  exceto: src/prisma/**  (singleton de DB)
  exceto: src/server.ts  (bootstrap)
```

### Estratégia de mocks

- **Controllers:** Prisma e Services são mockados via `jest.mock()`; supertest monta uma instância Express isolada.
- **Services:** Prisma é mockado para testar a lógica de negócio sem acesso ao banco.

### Cobertura por módulo

| Módulo | Cenários testados |
|---|---|
| `CreateUserController` | 201 criado, 409 duplicado, 500 erro inesperado |
| `AuthUserController` | 200 autenticado, 401 inválido, 500 erro inesperado |
| `DetailUserController` | 200 encontrado, 404 não encontrado, 500 erro inesperado |
| `LogoutController` | 200 sessões encerradas, chama service com id correto, 500 erro inesperado |
| `isAuthenticated` (middleware) | 401 sem header, 401 sem token após "Bearer", 401 token inválido/expirado, 401 usuário não encontrado, 401 tokenVersion divergente (sessão revogada), sucesso define `req.user_id` e chama `next()` |
| `CreateCategoryController` | 201 criada, 500 erro inesperado |
| `ListCategoryController` | 200 lista categorias, 500 erro inesperado |
| `CreateProductController` | 201 criado, 400 sem arquivo, 500 mimetype inválido, 404 categoria não encontrada, 500 erro inesperado |
| `ListProductController` | 200 com disabled=false por padrão, 200 com disabled=true, 200 com disabled=false explícito, 500 erro inesperado |
| `ArchiveProductController` | 200 arquivado, 404 produto não encontrado, 500 erro inesperado |
| `CreateOrderController` | 201 criado, 400 validação, 500 erro inesperado |
| `ListOrderController` | 200 lista pedidos com/sem `draft`, 500 erro inesperado |
| `AddItemOrderController` | 201 item criado, 404 pedido não encontrado, 404 produto não encontrado, 500 erro inesperado |
| `RemoveItemOrderController` | 200 item removido, 404 item não encontrado, 500 erro inesperado |
| `DetailOrderController` | 200 detalhes do pedido, 404 pedido não encontrado, 500 erro inesperado |
| `SendOrderController` | 200 pedido enviado, 404 pedido não encontrado, 500 erro inesperado |
| `FinishOrderController` | 200 pedido finalizado, 404 pedido não encontrado, 500 erro inesperado |
| `DeleteOrderController` | 200 pedido deletado, 404 pedido não encontrado, 500 erro inesperado |
| `CreateUserService` | cria usuário, rejeita duplicado, hash da senha |
| `AuthUserService` | retorna token, rejeita e-mail inválido, rejeita senha inválida |
| `DetailUserService` | retorna usuário, lança 404 se não encontrar |
| `LogoutService` | incrementa `tokenVersion`, retorna mensagem de sucesso, propaga erros do Prisma |
| `CreateCategoryService` | cria categoria, propaga erros do Prisma |
| `ListCategoryService` | lista categorias ordenadas por nome |
| `CreateProductService` | cria produto, valida categoria existente, faz upload da imagem (Cloudinary mockado), propaga erro de upload como 502 |
| `ListProductService` | lista produtos filtrando por `disabled` e ordenando por nome |
| `ArchiveProductService` | verifica existência do produto, arquiva (`disabled: true`), lança 404 se não encontrar, propaga erros inesperados do Prisma |
| `CreateOrderService` | cria pedido com defaults (`draft: true`, `status: false`) |
| `ListOrderService` | lista pedidos filtrando por `draft` e incluindo `orderItems`/`product` |
| `AddItemOrderService` | valida pedido e produto existentes, cria `OrderItem` |
| `RemoveItemOrderService` | valida item existente, remove, lança 404 se não encontrar |
| `DetailOrderService` | retorna pedido com itens e produtos, lança 404 se não encontrar |
| `SendOrderService` | atualiza `draft: false` e `name`, lança 404 se pedido não existir |
| `FinishOrderService` | atualiza `status: true`, lança 404 se pedido não existir, não atualiza quando não encontrado |
| `DeleteOrderService` | verifica existência, deleta, lança 404 se pedido não existir, não deleta quando não encontrado |

---

## Docker e Ambiente

### Variáveis de Ambiente (`.env`)

| Variável | Valor padrão | Descrição |
|---|---|---|
| `PORT` | `3333` | Porta do servidor Express |
| `DATABASE_URL` | `postgresql://docker:docker@postgres:5432/pizzaria` | URL de conexão do Prisma |
| `JWT_SECRET` | — | Segredo para assinar tokens JWT |
| `POSTGRES_USER` | `docker` | Usuário do banco |
| `POSTGRES_PASSWORD` | `docker` | Senha do banco |
| `POSTGRES_DB` | `pizzaria` | Nome do banco |
| `POSTGRES_PORT` | `5432` | Porta do PostgreSQL |
| `CLOUDINARY_CLOUD_NAME` | — | Nome da conta Cloudinary (upload de imagens de produto) |
| `CLOUDINARY_API_KEY` | — | API key do Cloudinary |
| `CLOUDINARY_API_SECRET` | — | API secret do Cloudinary |
| `CORS_ORIGIN` | — (permissivo se ausente) | Lista de origens permitidas separadas por vírgula. Sem essa variável, a API reflete a origem da requisição (`origin: true`) — adequado apenas para desenvolvimento; definir em produção assim que o domínio do frontend existir |

`DATABASE_URL`, `JWT_SECRET` e as três variáveis do Cloudinary são obrigatórias e validadas no startup por [`src/config/env.ts`](src/config/env.ts) — se alguma faltar ou for inválida, o processo encerra com `process.exit(1)` e uma mensagem listando o(s) campo(s) ausente(s), em vez de subir em estado inconsistente. Veja `.env.example` na raiz do backend para o template completo.

### Dockerfile

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN groupadd --system appgroup \
  && useradd --system --gid appgroup --home-dir /app appuser \
  && chown -R appuser:appgroup /app
USER appuser
EXPOSE 3333
CMD ["npx", "tsx", "src/server.ts"]
```

- `npm ci` em vez de `npm install`: instalação reprodutível a partir do `package-lock.json`.
- Roda como usuário não-root (`appuser`) — confirmado via `docker exec pizzaria_api whoami`.
- O `CMD` de produção sobe direto com `tsx`, sem `nodemon`. Em desenvolvimento, o [`docker-compose.yml`](../docker-compose.yml) da raiz do projeto **sobrescreve** esse `CMD` com `sh -c "npx prisma migrate deploy && npm run dev"` (hot reload via bind mount `./backend:/app`), então o fluxo de dev não é afetado por essa mudança.
- [`.dockerignore`](.dockerignore) exclui `.env`, `.git`, `*.md`, `coverage` e `src/generated/prisma` do contexto de build, evitando que segredos ou artefatos locais entrem na imagem.

### Instância do Prisma Client

**Arquivo:** [src/prisma/index.ts](src/prisma/index.ts)

```typescript
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
```

Exportado como singleton e importado diretamente nos Services e no middleware `isAdmin`.

---

## Segurança

Revisão de segurança feita em 2026-08-04. Todos os itens abaixo estão implementados e testados (unitários + validação manual com Docker rodando).

### Implementado

| Área | Medida | Onde |
|---|---|---|
| Rate limiting | `generalLimiter` (300 req/15min, todas as rotas) + `authLimiter` (10 req/15min, `/session` e `/users`) | [src/config/rateLimit.ts](src/config/rateLimit.ts) |
| CORS | Restrito via `CORS_ORIGIN` (lista de origens); sem a variável, permanece permissivo (`origin: true`) — configurar assim que houver um frontend com domínio definido | [src/server.ts](src/server.ts) |
| Headers HTTP | `helmet()` — HSTS, `X-Content-Type-Options`, `X-Frame-Options`, remoção de `X-Powered-By`, etc. | [src/server.ts](src/server.ts) |
| Validação de env no startup | `DATABASE_URL`, `JWT_SECRET`, credenciais do Cloudinary validadas via Zod; processo recusa subir se algo faltar | [src/config/env.ts](src/config/env.ts) |
| Hash de senha | bcrypt, custo 12 (era 8) | [CreateUserService.ts](src/services/user/CreateUserService.ts) |
| Política de senha | mínimo 8 caracteres + maiúscula + minúscula + número (era só 6 caracteres) | [userSchema.ts](src/schemas/userSchema.ts) |
| Algoritmo JWT fixado | `sign()`/`verify()` restritos a `HS256` — evita ataques de confusão de algoritmo | [AuthUserService.ts](src/services/user/AuthUserService.ts), [isAuthenticated.ts](src/middlewares/isAuthenticated.ts) |
| Revogação de sessão | campo `tokenVersion` no `User`, verificado a cada request; `POST /logout` incrementa e invalida todos os tokens já emitidos | [isAuthenticated.ts](src/middlewares/isAuthenticated.ts), [LogoutService.ts](src/services/user/LogoutService.ts) |
| Sanitização de upload | nome do arquivo normalizado (remove acentos/caracteres especiais) antes de compor o `public_id` do Cloudinary | [CreateProductService.ts](src/services/products/CreateProductService.ts) |
| Audit log | rotas `ADMIN` logam `{userId, method, path, statusCode}` estruturado em JSON | [auditLog.ts](src/middlewares/auditLog.ts) |
| Docker | usuário não-root com `HOME` fora de `/app` (evita vazar cache do npm/npx para o bind mount do host), `npm ci`, `.dockerignore` exclui `.env`/`.git`, `CMD` de produção sem `nodemon` | [Dockerfile](Dockerfile), [.dockerignore](.dockerignore) |
| Segredos | `.env` fora do git (`.gitignore`); `.env.example` documenta as variáveis sem expor valores reais | [.env.example](.env.example) |
| Dependências | `npm audit` resolveu 12 de 13 vulnerabilidades conhecidas (`npm audit fix`, sem `--force`, sem mudar ranges no `package.json`) — incluindo `qs`/`body-parser` (usadas pelo `express` em runtime). Ver detalhamento abaixo | `package-lock.json` |

Também confirmado por revisão de código: nenhum Controller usa spread de `req.body`/`req.query` direto no Prisma (sempre desestruturação explícita de campos) — sem risco de mass assignment (ex.: um cliente não consegue setar `role` ou `tokenVersion` via `POST /users`). Senhas nunca são logadas ou retornadas em respostas (`select` explícito em todas as queries de usuário). Erros inesperados (500) não vazam stack trace ao cliente.

### Dependências (`npm audit`)

Auditoria feita em 2026-08-04 encontrou 13 vulnerabilidades conhecidas nas dependências transitivas. `npm audit fix` (sem `--force`, sem alterar nenhum range de versão em `package.json`) resolveu 12 delas atualizando apenas o `package-lock.json` — revalidado com suíte de testes (157/157), `tsc --noEmit`, `prisma generate` e build + smoke test via Docker.

- **Corrigidas e relevantes ao runtime**: `qs` e `body-parser` (dependências do `express`, usado em toda requisição).
- **Corrigidas mas nunca chegavam ao runtime da API**: `hono`, `@hono/node-server`, `valibot`, `js-yaml`, `fast-uri` — todas vinham do CLI do `prisma` (`@prisma/dev`, usado internamente pelo Prisma Studio) ou de `jest`/`ts-jest`/`supertest` (só rodam durante os testes, nunca em produção).
- **Não corrigida — `esbuild` (baixa severidade)**: advisory é sobre leitura arbitrária de arquivo no *dev server* do esbuild no Windows. O `tsx` (usado no `CMD` de produção do Dockerfile) usa o esbuild só como biblioteca de transformação TS→JS, nunca sobe esse dev server — não é explorável no contexto desta aplicação. Sem fix disponível ainda no registry (nem com `--force`); reavaliar em atualizações futuras do `tsx`.

Recomenda-se rodar `npm audit` periodicamente (ex.: antes de cada release), já que novas vulnerabilidades em dependências transitivas surgem com o tempo independente de mudanças no código do projeto.

### Conhecido e aceito (trade-off deliberado, não é uma falha)

- **Rotas de pedido sem escopo por usuário**: qualquer `STAFF` autenticado pode ver/editar/cancelar qualquer pedido (não há "dono" do pedido). Isso é intencional — é um sistema de balcão compartilhado entre atendentes, não multi-tenant.
- **`CORS_ORIGIN` permissivo por padrão**: não há frontend com domínio definido ainda. Quando existir, definir `CORS_ORIGIN` no `.env` de produção.

### Ainda não avaliado — depende da topologia de deploy

- **`trust proxy` do Express**: se a API for colocada atrás de um reverse proxy/load balancer em produção (nginx, Cloudflare, etc.), configurar `app.set("trust proxy", ...)` com o número de saltos correto. Sem isso, o rate limiting por IP pode não diferenciar clientes (todos aparecem com o IP do proxy) ou, se configurado errado (confiando cegamente em `X-Forwarded-For`), pode ser burlado por spoofing de IP. Não configurado agora porque não há proxy no ambiente atual (`docker-compose.yml` expõe a API direto).
- **HTTPS**: terminação TLS não é responsabilidade da aplicação — deve ser feita pelo reverse proxy/plataforma de deploy quando o projeto for para produção.
