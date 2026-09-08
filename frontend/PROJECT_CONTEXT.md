# Projeto Pizzaria — Frontend: Documento de Contexto

> Dashboard administrativo da **AS Pizzaria** (cozinha/gerência). Consome a API REST do backend (`../backend`).
> Visão de todo o sistema: [`../PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md). Contexto da API: [`../backend/PROJECT_CONTEXT.md`](../backend/PROJECT_CONTEXT.md).

## Sumário

1. [Arquitetura](#arquitetura)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Dependências e Versões](#dependências-e-versões)
4. [Configuração](#configuração)
5. [Rotas e Páginas](#rotas-e-páginas)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Camada de Dados (API e Server Actions)](#camada-de-dados-api-e-server-actions)
8. [Componentes](#componentes)
9. [Hooks e Utilitários](#hooks-e-utilitários)
10. [Painel de Pedidos em Tempo Real](#painel-de-pedidos-em-tempo-real)
11. [Tema e Estilo](#tema-e-estilo)
12. [Docker e Ambiente](#docker-e-ambiente)
13. [Testes e Qualidade](#testes-e-qualidade)
14. [Endpoints Consumidos do Backend](#endpoints-consumidos-do-backend)

---

## Arquitetura

**Next.js 16 (App Router)** com **React 19** e **TypeScript**. Renderização no servidor por padrão (React Server Components); a interatividade fica em ilhas `"use client"`. Toda a comunicação com a API acontece **no servidor** — o token JWT nunca chega ao JavaScript do browser.

```
Browser
  │  (cookie httpOnly: token_pizzaria)
  ▼
┌───────────────────────────────────────────────────────────────┐
│                     Next.js (servidor)                         │
│                                                               │
│  proxy.ts ──────────────▶ valida /dashboard/* (GET /me)        │
│     │                        ↳ sem token → /login              │
│     │                        ↳ role ≠ ADMIN → /access-denied   │
│     ▼                                                          │
│  Server Component (page.tsx)                                   │
│     │  getToken() + fetchApi("/...", { token })                │
│     ▼                                                          │
│  render HTML + hidrata ilhas client                            │
│                                                               │
│  Server Action ("use server")  ◀── form / evento no client    │
│     │  assertAdmin() + fetchApi(...)  → revalidatePath(...)    │
└─────┼─────────────────────────────────────────────────────────┘
      ▼
   API REST (../backend, Bearer token)
```

**Fluxo resumido:**
- O `proxy.ts` (convenção do Next 16, ex-`middleware`) roda antes de qualquer rota `/dashboard/*` e faz a checagem de sessão + papel `ADMIN`.
- Cada **página** é um Server Component `async` que lê o cookie (`getToken()`) e busca dados via `fetchApi` com `cache: "no-store"`.
- Trechos interativos são **Client Components** que recebem os dados iniciais por props (`initial*`) e disparam **Server Actions** para alterar dados e revalidar.
- Cada Server Action de mutação chama `assertAdmin()` (defesa em profundidade além do `proxy`) e, no fim, `revalidatePath()` para a página recarregar os dados no servidor.

---

## Estrutura de Pastas

```
frontend/
├── Dockerfile                  # Build de produção multi-stage (deps → builder → runner non-root)
├── next.config.ts              # output: "standalone" + images.remotePatterns (Cloudinary)
├── components.json             # Config do shadcn (style "base-nova", baseColor "mist")
├── eslint.config.mjs           # eslint-config-next (core-web-vitals + typescript)
├── postcss.config.mjs          # @tailwindcss/postcss
├── tsconfig.json               # strict, moduleResolution "bundler", alias @/* → ./src/*
├── .env                        # API_URL, NEXT_PUBLIC_API_URL, WATCHPACK_POLLING (fora do git)
├── ENDPOINTS.md                # Cópia da referência de endpoints da API
└── src/
    ├── proxy.ts                # Guard de rota do Next 16 (matcher /dashboard/:path*)
    ├── app/
    │   ├── layout.tsx          # RootLayout: <html lang="pt-BR">, fontes (Inter + Geist Mono), metadata
    │   ├── globals.css         # Tailwind v4 CSS-first: @theme inline + tokens :root / .dark
    │   ├── page.tsx            # "/" → redirect para /dashboard ou /login
    │   ├── login/page.tsx      # Tela de login (redireciona se já autenticado)
    │   ├── access-denied/page.tsx  # Mostrada a quem não é ADMIN (botão "Sair")
    │   └── dashboard/
    │       ├── layout.tsx      # requiredAdminUser() + SidebarProvider + AppSidebar
    │       ├── page.tsx        # Painel de pedidos (OrdersBoard)
    │       ├── categories/page.tsx
    │       ├── products/page.tsx
    │       └── users/page.tsx
    ├── actions/                # Server Actions ("use server")
    │   ├── auth.ts             # loginUser, logoutUser
    │   ├── user.ts             # listUsers, createUser
    │   ├── category.ts         # createCategory, deleteCategory, moveCategoryProducts
    │   ├── product.ts          # createProduct, archiveProduct, deleteProduct
    │   └── order.ts            # fetchOrders, finishOrder, cancelOrder
    ├── lib/
    │   ├── api.ts              # fetchApi<T>() — wrapper de fetch com Bearer token
    │   ├── api-error.ts        # class ApiError { message, status, details? }
    │   ├── auth.ts             # cookie de sessão, getUser (cache), requiredAdminUser, assertAdmin
    │   ├── types.ts            # User, AccountUser, LoginUser, Category, Product, Order, OrderItem
    │   ├── order-utils.ts      # formatCurrency, relativeTime, orderTotal, groupOrderItems…
    │   └── utils.ts            # cn() (clsx + tailwind-merge)
    ├── hooks/
    │   ├── use-orders-feed.ts  # Polling + rastreio de pedidos novos
    │   ├── use-order-actions.ts# Transições de finalizar/cancelar pedido
    │   ├── use-now.ts          # Timestamp que se atualiza sozinho (rótulos "há X min")
    │   └── use-mobile.ts       # useIsMobile() (breakpoint 768px) — usado pela Sidebar
    └── components/
        ├── ui/                 # Primitivos shadcn / @base-ui/react (button, dialog, sheet, select, sidebar, table…)
        ├── forms/
        │   ├── auth-card.tsx   # Card de login/erro, com rodapé opcional
        │   └── login-form.tsx
        └── dashboard/
            ├── app-sidebar.tsx
            ├── nav-main.tsx    # Grupos: Geral, Cardápio, Administração
            ├── nav-user.tsx    # Rodapé da sidebar (usuário + Sair)
            ├── confirm-dialog.tsx   # Diálogo genérico de confirmação (com estado de erro/pending)
            ├── orders/         # Painel de pedidos (board, card, sheet, toolbar, stats, tabs, alerts…)
            ├── categories/     # create-category-dialog, category-row-actions
            ├── products/       # create-product-dialog, product-row-actions, price-input
            └── users/          # create-user-dialog, user-row-actions (excluir)
```

> Não existe a rota `/register`. O autocadastro foi removido — contas são criadas pela tela **Usuários** (só `ADMIN`).

---

## Dependências e Versões

### Produção

| Pacote | Versão | Finalidade |
|---|---|---|
| `next` | `16.3.0` | Framework (App Router, RSC, Server Actions, `proxy`) |
| `react` / `react-dom` | `19.2.8` | Biblioteca de UI |
| `@base-ui/react` | `^1.7.0` | Primitivos headless (base dos componentes shadcn "base-nova") |
| `shadcn` | `^4.16.1` | Registro de componentes; `globals.css` importa `shadcn/tailwind.css` |
| `lucide-react` | `^1.28.0` | Ícones |
| `class-variance-authority` | `^0.7.1` | Variantes de classe nos componentes UI |
| `clsx` + `tailwind-merge` | `^2.1.1` / `^3.6.0` | `cn()` — composição de classes |
| `tw-animate-css` | `^1.4.0` | Utilitários de animação (importado no `globals.css`) |

### Desenvolvimento

| Pacote | Versão | Finalidade |
|---|---|---|
| `typescript` | `^5` | Compilador (o `next build` roda o typecheck) |
| `tailwindcss` + `@tailwindcss/postcss` | `^4` | Tailwind v4 (config via CSS, sem `tailwind.config`) |
| `eslint` + `eslint-config-next` | `^9` / `16.3.0` | Lint (`core-web-vitals` + `typescript`) |
| `@types/node` `@types/react` `@types/react-dom` | `^20` / `^19` / `^19` | Tipos |

### Scripts (`package.json`)

```bash
npm run dev     # next dev --webpack  (webpack para o hot reload funcionar sob bind mount do Docker)
npm run build   # next build          (usa Turbopack; gera .next/standalone)
npm run start   # next start
npm run lint    # eslint
```

> Não há script `test` — ver [Testes e Qualidade](#testes-e-qualidade).

---

## Configuração

### TypeScript (`tsconfig.json`)

`strict: true`, `moduleResolution: "bundler"`, `noEmit`, `jsx: "react-jsx"`, plugin `next`. Alias `@/*` → `./src/*`. O `include` cobre `.next/types/**` e `.next/dev/types/**` (tipos de rota gerados pelo Next).

### Tailwind v4 (CSS-first)

Sem `tailwind.config.js`. Tudo em [`src/app/globals.css`](src/app/globals.css):
- `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`.
- `@custom-variant dark (&:is(.dark *))` — o modo escuro é acionado pela classe `.dark` num ancestral.
- `@theme inline { --color-*: var(--*); --radius-*: … }` — mapeia os tokens para utilitários do Tailwind.
- `:root` define a paleta clara (OKLCH) + `--radius: 0.625rem`; `.dark` sobrescreve.

### `next.config.ts`

```ts
{
  output: "standalone",                       // servidor mínimo em .next/standalone para a imagem Docker
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
}
```

### ESLint (`eslint.config.mjs`)

Flat config: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. Ignora `.next/`, `out/`, `build/`, `next-env.d.ts`.

---

## Rotas e Páginas

| Rota | Tipo | Proteção | O que faz |
|---|---|---|---|
| `/` | Server Component | — | `getUser()` → `redirect` para `/dashboard` (autenticado) ou `/login` |
| `/login` | Server Component | redireciona se já logado | Renderiza `<LoginForm>` |
| `/access-denied` | Estática | — | Mensagem para quem não é `ADMIN` + botão **Sair** (`logoutUser`) |
| `/dashboard` | Server Component | `proxy.ts` + `layout.tsx` (`requiredAdminUser`) | Painel de pedidos (`<OrdersBoard>`) |
| `/dashboard/categories` | Server Component | idem | Tabela de categorias + criar/excluir/mover produtos |
| `/dashboard/products` | Server Component | idem | Tabela (desktop) / cards (mobile) de produtos + criar/arquivar/excluir |
| `/dashboard/users` | Server Component | idem | Tabela de contas + diálogo "Novo usuário" (`STAFF`/`ADMIN`) + excluir conta (bloqueado na própria linha) |

O `dashboard/layout.tsx` chama `requiredAdminUser()` (redireciona) e monta `SidebarProvider` + `<AppSidebar user={user} />` + `<main>`.

`RootLayout` ([`src/app/layout.tsx`](src/app/layout.tsx)): `<html lang="pt-BR">`, fontes `Inter` (`--font-sans`) e `Geist_Mono` (`--font-geist-mono`) via `next/font/google`, `metadata` (`title: "AS Pizzaria"`).

---

## Autenticação e Autorização

### Cookie de sessão — [`src/lib/auth.ts`](src/lib/auth.ts)

| Atributo | Valor |
|---|---|
| Nome | `token_pizzaria` |
| `httpOnly` | `true` — inacessível ao JS do browser |
| `sameSite` | `strict` |
| `secure` | `true` em produção (`NODE_ENV === "production"`) |
| `maxAge` | **1 dia** — alinhado ao `expiresIn: "1d"` do JWT no backend |
| `path` | `/` |

Funções: `setToken` / `getToken` / `removeToken` (via `next/headers` `cookies()`), e:

- **`getUser()`** — `cache()` do React (uma chamada por request). Lê o token, faz `GET /me`; retorna `null` se não houver token ou vier `401`.
- **`requiredAdminUser()`** — `redirect("/login")` se não autenticado, `redirect("/access-denied")` se `role !== "ADMIN"`. Usada no `dashboard/layout.tsx`.
- **`assertAdmin()`** — **lança** `Error("Ação não autorizada.")` em vez de redirecionar (redirect dentro de Server Action não é confiável). Usada no início de toda Server Action de mutação.

### `proxy.ts` — [`src/proxy.ts`](src/proxy.ts)

Convenção do **Next 16** (o antigo `middleware` foi renomeado para `proxy`; o arquivo fica em `src/` ao lado de `app/` e exporta `proxy` + `config`). Roda no runtime **Node**.

```
config.matcher = ["/dashboard/:path*"]

proxy(request):
  token ausente → redirect /login
  GET /me com o token:
    role !== "ADMIN" → redirect /access-denied
    ApiError 401     → redirect /login
    ok               → NextResponse.next()
```

> É a primeira barreira, mas **não** a única: cada Server Action de mutação revalida com `assertAdmin()` (a doc do Next recomenda isso, porque Server Actions são endpoints `POST` próprios da rota).

### Login / Logout — [`src/actions/auth.ts`](src/actions/auth.ts)

- **`loginUser(prevState, formData)`** — `POST /session` → `setToken(response.token)`. Trata `400` (mostra `details[0].message`), `401` ("Credenciais inválidas."), `429`. Retorna `{ success, error, redirectTo?: "/dashboard" }` (o `<LoginForm>` faz `router.push`).
- **`logoutUser()`** — `POST /logout` (revoga o token no backend via `tokenVersion`), `removeToken()`, `redirect("/login")`. Se a chamada falhar (offline), o cookie é apagado mesmo assim.

---

## Camada de Dados (API e Server Actions)

### `fetchApi` — [`src/lib/api.ts`](src/lib/api.ts)

```ts
fetchApi<T>(endpoint, { token?, cache?, next?, ...RequestInit }): Promise<T>
```

- Base: `process.env.API_URL` (server-side — ex.: `http://api:3333` no Docker).
- Adiciona `Authorization: Bearer <token>` quando `token` é passado.
- `Content-Type: application/json` — exceto quando o `body` é `FormData` (upload de produto).
- Em `!response.ok`: lê o JSON de erro e lança **`ApiError(message, status, details?)`** (`message` vem de `errorData.message || errorData.error`).

**`ApiError`** ([`src/lib/api-error.ts`](src/lib/api-error.ts)): `{ name: "ApiError", message, status, details?: { field, message }[] }`.

### Server Actions

Todas em `src/actions/*.ts` com `"use server"`. As de mutação chamam `assertAdmin()` e terminam com `revalidatePath(...)`.

| Arquivo | Export | Método/Rota | Notas |
|---|---|---|---|
| `auth.ts` | `loginUser` | `POST /session` | grava o cookie |
| | `logoutUser` | `POST /logout` | apaga o cookie + `redirect` |
| `user.ts` | `listUsers()` | `GET /users` | `assertAdmin`; usada pela página Usuários |
| | `createUser(prev, formData)` | `POST /users` | `assertAdmin`; envia `role` só se for `STAFF`/`ADMIN` |
| | `deleteUser(userId)` | `DELETE /users` | `assertAdmin`; lança `Error` com a mensagem da API (usada pelo `ConfirmDialog`) |
| `category.ts` | `createCategory` | `POST /category` | `assertAdmin` |
| | `deleteCategory` | `DELETE /category` | `assertAdmin` |
| | `moveCategoryProducts` | `PATCH /category/products` | `assertAdmin`; revalida categories + products |
| `product.ts` | `createProduct` | `POST /product` (multipart) | `assertAdmin`; valida campos antes de enviar |
| | `archiveProduct` | `PATCH /product` | `assertAdmin` |
| | `deleteProduct` | `DELETE /product` | `assertAdmin` |
| `order.ts` | `fetchOrders()` | `GET /orders?draft=false` | **sem** `assertAdmin` (leitura; já protegida pelo proxy/layout); ordena por `createdAt` desc |
| | `finishOrder(id)` | `PUT /order/finish` | `assertAdmin`; `revalidatePath("/dashboard")` |
| | `cancelOrder(id)` | `DELETE /order/delete` | `assertAdmin`; `revalidatePath("/dashboard")` |

### Padrão de leitura nas páginas

Cada `page.tsx` de dashboard define um helper `async` local (`getCategoriesData`, `getProductsData`, …) que:
1. `const token = await getToken()`
2. `fetchApi(..., { token, cache: "no-store" })` — muitas vezes em `Promise.all`
3. no `catch`, loga e retorna `{ ..., error: mensagem }` para a página renderizar um estado de erro em vez de quebrar.

### Tipos — [`src/lib/types.ts`](src/lib/types.ts)

`User { id, name, email, role: "ADMIN" | "STAFF" }` · `AccountUser extends User { createdAt }` (GET/POST `/users`) · `LoginUser extends User { token }` · `Category` · `Product { …, price /* centavos */, banner, disabled }` · `Order { id, table, name, draft, status, createdAt, orderItems }` · `OrderItem { id, amount, product }`.

---

## Componentes

### `src/components/ui/` — primitivos (shadcn "base-nova" sobre `@base-ui/react`)

`button`, `card`, `dialog`, `input`, `label`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `textarea`, `toast`, `tooltip`. O `<Select>` renderiza um `<input hidden name=…>` para funcionar em `<form action={serverAction}>`.

### `src/components/forms/`

- **`auth-card.tsx`** — card centralizado "AS **Pizzaria**"; props de rodapé (`footerText`/`footerLinkHref`/`footerLinkText`) são **opcionais** (o rodapé "criar conta" saiu com o autocadastro).
- **`login-form.tsx`** — `useActionState(loginUser)`, mostrar/ocultar senha, `router.push(state.redirectTo)`.

### `src/components/dashboard/`

- **`app-sidebar.tsx`** — `Sidebar` colapsável (`collapsible="icon"`); header com a marca, `<NavMain>`, `<NavUser>`.
- **`nav-main.tsx`** — grupos **Geral** (Pedidos), **Cardápio** (Categorias, Produtos), **Administração** (Usuários). Item ativo em âmbar (`data-active:…text-amber-700 dark:…text-amber-400`).
- **`nav-user.tsx`** — iniciais + nome + e-mail; botão **Sair** dentro de `<form action={logoutUser}>`.
- **`confirm-dialog.tsx`** — diálogo genérico de confirmação: `onConfirm: () => Promise<void>`, estado `isPending` (via `useTransition`), captura de erro, `warning` opcional, `hideConfirm` / `confirmDisabled`, `children` (ex.: um `<Select>`). Usado por categorias e produtos.
- **`categories/`** — `create-category-dialog` (diálogo com remount via `formKey` no fechamento) · `category-row-actions` (excluir; se a categoria tem produtos, obriga escolher uma categoria destino e chama `moveCategoryProducts` antes de `deleteCategory`).
- **`products/`** — `create-product-dialog` (nome, descrição, categoria via `<Select>`, `price-input`, upload de imagem com preview `blob:`) · `product-row-actions` (arquivar / excluir) · `price-input` (mostra `R$ 45,90`, envia só dígitos em `<input hidden name="price">`).
- **`users/`** — `create-user-dialog` (nome, e-mail, senha com regras, cargo Atendente/Admin via `<Select>`) · `user-row-actions` (excluir via `ConfirmDialog`; some na linha do próprio usuário, avisa quando o alvo é ADMIN).
- **`orders/`** — ver a seção seguinte.

---

## Hooks e Utilitários

### Hooks (`src/hooks/`)

- **`use-orders-feed.ts`** — carga inicial vinda do Server Component; **polling a cada 15 s** enquanto `document.visibilityState === "visible"`; re-sincroniza no evento `visibilitychange`; guarda `knownIdsRef` e expõe `newOrderIds` (Set), `acknowledgeOrder(id)`, `dismissNewOrders()`, `refresh()`, `isRefreshing`, `lastUpdated`.
- **`use-order-actions.ts`** — encapsula `finish` / `cancel` com `useTransition` (estados `isFinishing`/`isCancelling`/`busy`) e uma mensagem de erro compartilhada.
- **`use-now.ts`** — `useNow(intervalMs = 30_000)`: timestamp que se atualiza sozinho para manter rótulos "há X min" frescos.
- **`use-mobile.ts`** — `useIsMobile()` (media query `max-width: 767px`); usado pela `Sidebar`.

### Utilitários

- **`order-utils.ts`** — `formatCurrency(cents)` (`Intl` pt-BR/BRL), `formatTime` / `formatDateTime`, `relativeTime(value, now)`, `orderTotal(order)` e `orderItemCount(order)` (em centavos / unidades), e **`groupOrderItems(items)`** — consolida `OrderItem`s do mesmo produto numa linha só para exibição (o backend cria um item novo a cada `POST /order/add`; hoje ele também agrupa no servidor, mas o front mantém isso para robustez).
- **`utils.ts`** — `cn(...)` = `twMerge(clsx(...))`.

---

## Painel de Pedidos em Tempo Real

`dashboard/page.tsx` (Server Component) chama `fetchOrders()` e passa `initialOrders`/`initialError` para **`<OrdersBoard>`** (client).

```
OrdersBoard
├── useOrdersFeed({ initialOrders, autoRefresh, onNewOrders })   ← polling 15s + pedidos "novos"
├── useNow()                                                     ← rótulos relativos
├── onNewOrders → playNewOrderChime()  + showNewOrderNotification()
│
├── <OrdersToolbar>       Atualizar · Automático on/off · Alertas on/off · pílula "N novos pedidos"
├── <OrdersStats>         Em preparo · Finalizados · A receber (soma dos pedidos em preparo)
├── <OrdersFilterTabs>    preparo | finalizados | todos  (com contadores)
├── grid de <OrderCard>   mesa, nome, prévia de até 3 itens, horário, total; realce âmbar se "novo"
└── <OrderDetailsSheet>   painel lateral: itens (<OrderItemsList>), total,
                          "Finalizar pedido" (verde) e "Cancelar pedido" (confirmação em 2 passos)
```

- **Alertas** ([`orders/order-alerts.ts`](src/components/dashboard/orders/order-alerts.ts)): `playNewOrderChime()` gera um bipe de dois tons via Web Audio; `showNewOrderNotification()` usa a Notification API do sistema (`tag: "pedido-novo"` para não empilhar). Ligar "Alertas" também pede `Notification.requestPermission()`.
- **Estado do pedido**: `status` (`false` = em preparo, `true` = finalizado). O `<OrderStatusBadge>` traduz isso. O board só lista pedidos já enviados (`draft: false`).
- Finalizar/cancelar chamam as Server Actions e depois `refresh()` para re-sincronizar a lista.

---

## Tema e Estilo

- **Tailwind v4 CSS-first** em [`globals.css`](src/app/globals.css). Paleta em **OKLCH**, quase neutra (tons de ardósia/cinza), `--radius: 0.625rem` (10 px). `:root` = tema claro; `.dark` sobrescreve os tokens.
- **Cor de destaque: âmbar.** Não é um token do tema — é aplicada componente a componente com utilitários do Tailwind: `bg-amber-500` / `text-amber-600 dark:text-amber-400` / `ring-amber-500/30`. Aparece em CTAs primários, item de navegação ativo, selo "Em preparo", realce de pedido novo, marca "**Pizzaria**".
- **Modo escuro**: previsto (`@custom-variant dark` + bloco `.dark`), mas **não há toggle na UI** e a classe `.dark` nunca é adicionada — na prática o dashboard roda em tema claro hoje. As classes `dark:` já estão nos componentes para quando isso for ligado.
- **Fontes**: `Inter` (texto, `--font-sans`) e `Geist_Mono` (`--font-geist-mono`) via `next/font/google`, aplicadas no `<html>` do `RootLayout`.
- Ícones: `lucide-react`. Composição de classes sempre via `cn()`.

---

## Docker e Ambiente

### `Dockerfile` (produção) — multi-stage

| Estágio | O que faz |
|---|---|
| `deps` | `npm ci` a partir do `package-lock.json` |
| `builder` | `COPY` do código + `npm run build` (usa `NEXT_PUBLIC_API_URL` como `ARG` — variáveis `NEXT_PUBLIC_*` são embutidas no bundle em build time); gera `.next/standalone` |
| `runner` | usuário não-root `nextjs` (uid 1001), copia `public/`, `.next/standalone` e `.next/static`, `CMD ["node", "server.js"]`, `PORT=3000` |

### `docker-compose.yml` (desenvolvimento)

O serviço `frontend` usa **`build.target: deps`** (só o estágio com `node_modules`) + bind mount `./frontend:/app` + volumes anônimos para `/app/node_modules` e `/app/.next` + `command: sh -c "npm run dev"`. Ou seja: em dev roda o **dev server do webpack** (por causa do `--webpack` no script e do `WATCHPACK_POLLING`), não o build standalone.

### Variáveis de ambiente (`.env`, fora do git)

| Variável | Exemplo | Uso |
|---|---|---|
| `API_URL` | `http://api:3333` (Docker) / `http://localhost:3333` | Base do `fetchApi` **no servidor** |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333` | Exposta ao browser (hoje sem uso direto no client — tudo passa por Server Actions/Components) |
| `WATCHPACK_POLLING` | `true` | Hot reload do webpack sob o bind mount do Docker |

`.dockerignore`: `node_modules`, `.next`. `.gitignore`: `.env*`, `/.next/`, `/node_modules`, `*.tsbuildinfo`.

---

## Testes e Qualidade

- **Não há suíte de testes no frontend** — sem `jest`/`vitest`/`@testing-library`, sem script `test`. (O backend tem cobertura ampla; ver [`../backend/PROJECT_CONTEXT.md`](../backend/PROJECT_CONTEXT.md).)
- Verificação atual:
  - **`npm run build`** — compila e roda o **typecheck** (`tsc`) de todo o projeto; um build limpo é o portão principal.
  - **`npm run lint`** — `eslint-config-next`. Há **1 aviso pré-existente** em [`src/hooks/use-mobile.ts`](src/hooks/use-mobile.ts) (`react-hooks/set-state-in-effect`, código boilerplate do shadcn) — não introduzido pelas mudanças recentes.
- Ideias para quando fizer sentido: testes de componente (Testing Library) para `LoginForm`, `ConfirmDialog`, `CreateUserDialog`; testes das Server Actions com o `fetch` mockado (mapeamento de `ApiError` → mensagem).

---

## Endpoints Consumidos do Backend

| Origem no front | Método/Rota | Auth |
|---|---|---|
| `proxy.ts`, `lib/auth.ts` (`getUser`) | `GET /me` | Bearer |
| `actions/auth.ts` | `POST /session`, `POST /logout` | — / Bearer |
| `actions/user.ts` | `GET /users`, `POST /users`, `DELETE /users` | Bearer + ADMIN |
| `actions/category.ts`, `categories/page.tsx` | `GET /category-list`, `POST /category`, `DELETE /category`, `PATCH /category/products` | Bearer (+ ADMIN nas mutações) |
| `actions/product.ts`, `products/page.tsx` | `GET /products`, `POST /product`, `PATCH /product`, `DELETE /product` | Bearer (+ ADMIN nas mutações) |
| `actions/order.ts`, `dashboard/page.tsx` | `GET /orders?draft=false`, `PUT /order/finish`, `DELETE /order/delete` | Bearer |

Referência completa dos endpoints: [`ENDPOINTS.md`](ENDPOINTS.md).
