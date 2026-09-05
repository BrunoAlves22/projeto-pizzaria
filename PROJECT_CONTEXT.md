# Projeto Pizzaria — Contexto Geral do Sistema

> Documento de contexto de **todo o sistema** (backend + dashboard web + app mobile do garçom).
> O contexto detalhado do backend está em [`backend/PROJECT_CONTEXT.md`](backend/PROJECT_CONTEXT.md).
> O contexto detalhado do frontend está em [`frontend/PROJECT_CONTEXT.md`](frontend/PROJECT_CONTEXT.md).
> O guia para construir o app do garçom está em [`mobile/README.md`](mobile/README.md).

---

## 1. Visão geral

Sistema de gestão de pedidos para uma pizzaria/restaurante de balcão. É composto por três aplicações que conversam com uma única API REST:

| Aplicação | Stack | Usuário | Responsabilidade |
|---|---|---|---|
| **Backend / API** | Node.js + Express 5 + Prisma 7 + PostgreSQL | — | Regras de negócio, autenticação, persistência |
| **Dashboard web** | Next.js 16 (App Router) + React 19 + Tailwind + shadcn | Administrador / cozinha | Cadastro de categorias e produtos, painel de pedidos enviados, finalizar/cancelar pedido |
| **App mobile** (a construir) | React Native + Expo (sugerido) | Garçom (`STAFF`) | Anotar o pedido na mesa, montar a comanda e enviar para a cozinha |

### Fluxo de ponta a ponta

```
┌─────────────┐   monta e envia o pedido    ┌──────────────┐   lê pedidos (polling)   ┌──────────────┐
│  App Mobile │ ─────────────────────────▶  │   API REST   │ ◀──────────────────────  │ Dashboard Web│
│  (garçom)   │   POST /order               │  Express +   │   GET /orders?draft=false│  (cozinha)   │
│             │   POST /order/add           │  Prisma +    │                          │              │
│             │   PUT  /order/send          │  PostgreSQL  │   PUT /order/finish      │              │
└─────────────┘                             └──────────────┘   DELETE /order/delete   └──────────────┘
```

1. O garçom faz login no app (`POST /session`) e recebe um JWT.
2. O app carrega o cardápio (`GET /category-list`, `GET /products` ou `GET /category/product`).
3. Na mesa, o garçom cria o pedido (`POST /order` → `draft: true`).
4. Adiciona/remualtera itens (`POST /order/add`, `DELETE /order/remove`). Itens repetidos do mesmo produto são somados na mesma linha.
5. Revisa (`GET /order/detail`) e envia para a cozinha (`PUT /order/send` → `draft: false`).
6. O dashboard, que faz polling em `GET /orders?draft=false`, mostra o pedido novo para a cozinha.
7. A cozinha finaliza (`PUT /order/finish` → `status: true`) ou cancela (`DELETE /order/delete`).

> Um pedido tem dois booleanos de estado: `draft` (`true` = rascunho do garçom, `false` = enviado) e `status` (`false` = em preparo, `true` = finalizado).

---

## 2. Estrutura do repositório

```
Projeto Pizzaria/
├── docker-compose.yml         # Sobe postgres + api + frontend em dev
├── PROJECT_CONTEXT.md         # (este arquivo)
├── backend/
│   ├── PROJECT_CONTEXT.md     # Contexto detalhado da API (arquitetura, endpoints, schemas, segurança)
│   ├── ENDPOINTS.md           # Referência de endpoints
│   ├── src/                   # controllers / services / middlewares / schemas / routes
│   ├── prisma/schema.prisma   # Modelagem do banco
│   └── .env.example
├── frontend/                  # Dashboard web (Next.js)
│   ├── src/app/               # Rotas (login, register, dashboard/*)
│   ├── src/actions/           # Server actions (auth, order, product, category)
│   ├── src/lib/               # api.ts, auth.ts, types.ts
│   └── ENDPOINTS.md
└── mobile/                    # App do garçom (a criar)
    └── README.md              # Guia de construção
```

---

## 3. Modelo de dados (resumo)

| Entidade | Campos-chave | Observações |
|---|---|---|
| **User** | `id`, `name`, `email` (unique), `password` (bcrypt 12), `role` (`STAFF` \| `ADMIN`), `tokenVersion` | `tokenVersion` é incrementado no `POST /logout` para revogar todos os JWT emitidos antes |
| **Category** | `id`, `name` | `1 ── N Product` |
| **Product** | `id`, `name`, `description`, `price` (Int, **centavos**), `banner` (URL Cloudinary), `disabled`, `categoryId` | `disabled: true` = arquivado; não aparece no cardápio |
| **Order** | `id`, `table` (Int), `name`, `draft` (Bool, default `true`), `status` (Bool, default `false`) | Sem "dono": balcão compartilhado entre atendentes |
| **OrderItem** | `id`, `orderId`, `productId`, `amount` (Int) | `onDelete: Cascade` a partir de Order e Product |

`price` é sempre inteiro em centavos. Exibição: `price / 100` formatado como `R$`.

---

## 4. Autenticação e autorização

- **JWT Bearer**, algoritmo `HS256` fixado em `sign()` e `verify()`. Expiração `1d`. Secret em `JWT_SECRET`.
- Header: `Authorization: Bearer <token>`.
- Payload: `{ name, email, tokenVersion, sub: <userId>, iat, exp }`.
- **Revogação**: `POST /logout` incrementa `User.tokenVersion`; `isAuthenticated` compara o `tokenVersion` do token com o do banco a cada request.
- **Papéis**:
  - `STAFF` — padrão. Cria/edita/envia pedidos, lista cardápio. **É o papel do garçom no app mobile.**
  - `ADMIN` — tudo do STAFF + cadastro de categorias/produtos + (hoje) acesso ao dashboard web.
- As **rotas de pedido não exigem ADMIN** — qualquer usuário autenticado pode criar, listar, editar, enviar, finalizar ou deletar qualquer pedido. É intencional (balcão compartilhado), não multi-tenant. As mutações (`send`/`finish`/`delete`) passam pelo `auditLog`.
- **Cadastro de usuários (`POST /users`) é restrito a `ADMIN`.** O primeiro ADMIN é criado pelo seed: definir `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env` do backend e rodar `npx prisma db seed`. Não há mais tela pública de registro — a partir daí o ADMIN cria e lista as contas (atendente ou administrador) na tela **Usuários** do dashboard (`/dashboard/users`, `GET /users` + `POST /users`).

### Decisão em aberto (ver revisão de segurança)

O dashboard web hoje exige `ADMIN`. Como o garçom é `STAFF`, isso força tornar a cozinha ADMIN. Recomendação: criar papel `KITCHEN` ou liberar a visão de pedidos para `STAFF`, deixando ADMIN só para cadastro de catálogo e usuários.

---

## 5. Referência rápida de endpoints

**Base URL (dev):** `http://localhost:3333`

| Método | Rota | Auth | Admin | Uso no app mobile |
|---|---|---|---|---|
| `POST` | `/users` | Sim | Sim | — (o ADMIN provisiona as contas pela tela **Usuários**; 1º ADMIN vem do seed) |
| `GET` | `/users` | Sim | Sim | — (listagem de contas, usada pela tela **Usuários** do dashboard) |
| `POST` | `/session` | Não | Não | **Login do garçom** |
| `GET` | `/me` | Sim | Não | Validar sessão / dados do usuário |
| `POST` | `/logout` | Sim | Não | Sair (revoga o token) |
| `GET` | `/category-list` | Sim | Não | **Abas do cardápio** |
| `GET` | `/products` | Sim | Não | **Cardápio completo** (`?disabled=false`) |
| `GET` | `/category/product` | Sim | Não | Cardápio por categoria (`?category_id=`) |
| `POST` | `/category` | Sim | Sim | — |
| `POST` `PATCH` `DELETE` | `/product` | Sim | Sim | — |
| `PATCH` | `/category/products` | Sim | Sim | — (mover produtos entre categorias) |
| `POST` | `/order` | Sim | Não | **Criar comanda** `{ table, name }` |
| `GET` | `/orders` | Sim | Não | Listar (`?draft=false` = enviados; `?draft=true` = rascunhos) |
| `POST` | `/order/add` | Sim | Não | **Adicionar item** `{ orderId, productId, amount }` |
| `DELETE` | `/order/remove` | Sim | Não | **Remover item** (`?itemId=`) |
| `GET` | `/order/detail` | Sim | Não | **Revisar comanda** (`?orderId=`) |
| `PUT` | `/order/send` | Sim | Não | **Enviar para a cozinha** `{ name, orderId }` |
| `PUT` | `/order/finish` | Sim | Não | Finalizar (`{ orderId }`) — usado pela cozinha |
| `DELETE` | `/order/delete` | Sim | Não | Cancelar (`?orderId=`) |

Rate limit: `/session` e `/users` → 10 req/15min por IP; demais → 300 req/15min por IP.

Formato de erro:
- Validação (400): `{ "error": "Error Validation", "details": [{ "field": "table", "message": "..." }] }`
- Negócio: `{ "message": "Pedido não encontrado" }` com o status HTTP correspondente (401/403/404/409/429/500/502).

---

## 6. Ambiente de desenvolvimento

```bash
# Na raiz do projeto
docker compose up --build
# postgres  → localhost:5433
# api       → localhost:3333
# dashboard → localhost:3000
```

Sem Docker (backend):

```bash
cd backend
cp .env.example .env      # preencher JWT_SECRET, Cloudinary e ADMIN_EMAIL/ADMIN_PASSWORD
npm install
npx prisma migrate deploy
npx prisma db seed        # cria o primeiro ADMIN a partir do .env
npm run dev
```

### Variáveis de ambiente (backend)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Conexão PostgreSQL |
| `JWT_SECRET` | sim (min. 16 chars) | Segredo de assinatura do JWT |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | sim | Upload de imagem de produto |
| `PORT` | não (3333) | Porta da API |
| `CORS_ORIGIN` | não | Lista de origens separadas por vírgula; ausente = reflete a origem (só dev) + warning no log |
| `TRUST_PROXY` | não | `true` ou nº de saltos, quando a API roda atrás de reverse proxy/LB |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | só p/ seed | Conta ADMIN inicial criada por `npx prisma db seed` |

---

## 7. Estado atual e roadmap

**Pronto:**
- API completa (usuários, categorias, produtos, pedidos) com testes (Jest + supertest).
- Dashboard web: login, sidebar, CRUD de categorias e produtos, painel de pedidos com polling, detalhes, finalizar/cancelar, e **tela Usuários** (listar contas + criar atendente/admin).

**A fazer:**
- **App mobile do garçom** (`mobile/`) — ver [`mobile/README.md`](mobile/README.md).
- Papel `KITCHEN` ou ajuste de autorização do dashboard.
- Endurecimento para produção: definir `CORS_ORIGIN` e `TRUST_PROXY`, HTTPS/TLS no proxy, **tirar o repositório do OneDrive e rotacionar `JWT_SECRET` + chaves do Cloudinary** (segredos foram sincronizados).

**Correções de segurança já aplicadas (2026-09):** `POST /users` restrito a ADMIN + seed do 1º admin + tela Usuários no dashboard (`GET /users` ADMIN); `auditLog` nas mutações de pedido; rate limit de login por IP+e-mail com `skipSuccessfulRequests`; `TRUST_PROXY` configurável; `express.json` com limite de 10 kb; `isAdmin` com `select` mínimo; cookie do dashboard alinhado a 1 dia; `assertAdmin()` nas Server Actions de mutação; Dockerfile de produção do frontend (multi-stage, non-root, `output: standalone`); limites em `table`/`name` do pedido.
