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
    │   │   └── __tests__/
    │   │       ├── CreateUserController.spec.ts
    │   │       ├── AuthUserController.spec.ts
    │   │       └── DetailUserController.spec.ts
    │   ├── category/
    │   │   ├── CreateCategoryController.ts
    │   │   ├── ListCategoryController.ts
    │   │   └── __tests__/
    │   │       ├── CreateCategoryController.spec.ts
    │   │       └── ListCategoryController.spec.ts
    │   └── products/
    │       ├── CreateProductController.ts
    │       ├── ListProductController.ts
    │       ├── ArchiveProductController.ts
    │       └── __tests__/
    │           ├── CreateProductController.spec.ts
    │           ├── ListProductController.spec.ts
    │           └── ArchiveProductController.spec.ts
    ├── services/
    │   ├── user/
    │   │   ├── CreateUserService.ts
    │   │   ├── AuthUserService.ts
    │   │   ├── DetailUserService.ts
    │   │   └── __tests__/
    │   │       ├── CreateUserService.spec.ts
    │   │       ├── AuthUserService.spec.ts
    │   │       └── DetailUserService.spec.ts
    │   ├── category/
    │   │   ├── CreateCategoryService.ts
    │   │   ├── ListCategoryService.ts
    │   │   └── __tests__/
    │   │       ├── CreateCategoryService.spec.ts
    │   │       └── ListCategoryService.spec.ts
    │   └── products/
    │       ├── CreateProductService.ts
    │       ├── ListProductService.ts
    │       ├── ArchiveProductService.ts
    │       └── __tests__/
    │           ├── CreateProductService.spec.ts
    │           ├── ListProductService.spec.ts
    │           └── ArchiveProductService.spec.ts
    ├── config/
    │   ├── multer.ts            # Configuração de upload (memoryStorage, filtro de mimetype, limite 5MB)
    │   └── cloudinary.ts        # Configuração do client Cloudinary (v2)
    ├── middlewares/
    │   ├── errorHandler.ts     # Middleware global de erros
    │   ├── isAuthenticated.ts  # Validação do JWT
    │   ├── isAdmin.ts          # Verificação de role ADMIN
    │   └── validateSchema.ts   # Validação de body/query/params com Zod
    ├── schemas/
    │   ├── userSchema.ts       # Schemas Zod para rotas de usuário
    │   ├── categorySchema.ts   # Schema Zod para rota de categoria
    │   └── productSchema.ts   # Schema Zod para rota de produto
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
│ createdAt    │                              │ banner       │
│ updatedAt    │                              │ disabled     │
└──────────────┘                              │ createdAt    │
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
| `password` | String | hash bcrypt |
| `role` | Role (enum) | default: `STAFF` |
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
| `POST` | `/category` | Sim | Sim | `createCategorySchema` |
| `GET` | `/category-list` | Sim | Não | — |
| `POST` | `/product` | Sim | Sim | `createProductSchema` (+ upload `file`) |
| `GET` | `/products` | Sim | Não | `listProductSchema` |
| `PATCH` | `/product` | Sim | Sim | `archiveProductSchema` |

---

### `POST /users` — Criar usuário

**Middlewares:** `validateSchema(createUserSchema)`

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

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

---

### `POST /session` — Autenticar usuário

**Middlewares:** `validateSchema(authUserSchema)`

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

### `POST /category` — Criar categoria

**Middlewares:** `isAuthenticated` → `isAdmin` → `validateSchema(createCategorySchema)`  
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

**Middlewares:** `isAuthenticated` → `isAdmin` → `upload.single("file")` (multer) → `validateSchema(createProductSchema)`  
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
5. Faz upload do buffer da imagem para o Cloudinary (pasta `pizzaria`, `public_id` com timestamp) via stream; falha no upload gera `AppError(502)`.
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

**Middlewares:** `isAuthenticated` → `isAdmin` → `validateSchema(archiveProductSchema)`  
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

## Middlewares

### `isAuthenticated`

**Arquivo:** [src/middlewares/isAuthenticated.ts](src/middlewares/isAuthenticated.ts)

Valida o JWT enviado no header `Authorization: Bearer <token>`.  
Em caso de sucesso, injeta `req.user_id` (extraído do `sub` do token) e chama `next()`.

```
Header Authorization presente?
  Não → 401 "Token não fornecido"
  Sim → extrai token após "Bearer "
         Token presente?
           Não → 401
           Sim → verify(token, JWT_SECRET)
                  Válido? → req.user_id = sub → next()
                  Inválido? → 401 "Token inválido"
```

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
    password: z.string({ error: "Senha é obrigatória" })
               .min(6, { error: "Senha tem que conter 6 caracteres no mínimo" }),
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

**Formato de erro retornado ao cliente:**
```json
{
  "error": "Error Validation",
  "details": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "Senha tem que conter 6 caracteres no mínimo" }
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
| `500` | Erro inesperado do servidor |
| `502` | Falha ao integrar com serviço externo (upload de imagem no Cloudinary) |

---

## Autenticação e Autorização

**Tipo:** JWT (Bearer Token)  
**Biblioteca:** `jsonwebtoken` 9.0.3  
**Secret:** variável de ambiente `JWT_SECRET`  
**Expiração:** `1d` (1 dia)

**Payload do token:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
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
| `CreateCategoryController` | 201 criada, 500 erro inesperado |
| `ListCategoryController` | 200 lista categorias, 500 erro inesperado |
| `CreateProductController` | 201 criado, 400 sem arquivo, 500 mimetype inválido, 404 categoria não encontrada, 500 erro inesperado |
| `ListProductController` | 200 com disabled=false por padrão, 200 com disabled=true, 200 com disabled=false explícito, 500 erro inesperado |
| `ArchiveProductController` | 200 arquivado, 404 produto não encontrado, 500 erro inesperado |
| `CreateUserService` | cria usuário, rejeita duplicado, hash da senha |
| `AuthUserService` | retorna token, rejeita e-mail inválido, rejeita senha inválida |
| `DetailUserService` | retorna usuário, lança 404 se não encontrar |
| `CreateCategoryService` | cria categoria, propaga erros do Prisma |
| `ListCategoryService` | lista categorias ordenadas por nome |
| `CreateProductService` | cria produto, valida categoria existente, faz upload da imagem (Cloudinary mockado), propaga erro de upload como 502 |
| `ListProductService` | lista produtos filtrando por `disabled` e ordenando por nome |
| `ArchiveProductService` | verifica existência do produto, arquiva (`disabled: true`), lança 404 se não encontrar, propaga erros inesperados do Prisma |

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

### Dockerfile

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3333
CMD ["npm", "run", "dev"]
```

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
