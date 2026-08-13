# API Endpoints — Pizzaria Backend

**Base URL:** `http://localhost:3333`

Todas as rotas autenticadas exigem o header:
```
Authorization: Bearer <token>
```

## Sumário

- [Usuários](#usuários)
- [Categorias](#categorias)
- [Produtos](#produtos)
- [Pedidos](#pedidos)
- [Códigos de erro](#códigos-de-erro)

## Referência rápida

| Método | Rota | Auth | Admin | Schema |
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

---

## Usuários

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

Senha deve ter no mínimo 8 caracteres, com ao menos uma letra maiúscula, uma minúscula e um número.

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

**Erros:** `400` validação falhou · `409` e-mail já cadastrado · `429` muitas tentativas (rate limit)

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

**Erros:** `400` validação falhou · `401` e-mail ou senha incorretos · `429` muitas tentativas (rate limit)

---

### `GET /me` — Detalhes do usuário autenticado

**Middlewares:** `isAuthenticated`

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:** `401` token não fornecido/inválido · `404` usuário não encontrado

---

### `POST /logout` — Encerrar sessões do usuário

**Middlewares:** `isAuthenticated`

Invalida todos os tokens já emitidos para o usuário (incrementa `tokenVersion`). Após chamar essa rota, qualquer token JWT emitido anteriormente passa a ser rejeitado por `isAuthenticated`, mesmo que ainda não tenha expirado — inclusive o token usado na própria chamada.

**Resposta 200:**
```json
{ "message": "Sessões encerradas com sucesso" }
```

**Erros:** `401` não autenticado

---

## Categorias

### `POST /category` — Criar categoria

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(createCategorySchema)` (role `ADMIN`)

**Body:**
```json
{ "name": "Pizzas" }
```

**Resposta 201:**
```json
{
  "id": "uuid",
  "name": "Pizzas",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Erros:** `400` nome vazio · `401` não autenticado · `403` não é ADMIN

---

### `GET /category-list` — Listar categorias

**Middlewares:** `isAuthenticated`

Ordenadas por `name` (asc). Qualquer usuário autenticado pode listar (não exige `ADMIN`).

**Resposta 200:**
```json
[
  { "id": "uuid", "name": "Pizzas", "createdAt": "2024-01-01T00:00:00.000Z" }
]
```

**Erros:** `401` não autenticado

---

## Produtos

### `POST /product` — Criar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `upload.single("file")` (multer) → `validateSchema(createProductSchema)` (role `ADMIN`)
**Content-Type:** `multipart/form-data`

**Campos do form-data:**
```
name: string          (obrigatório)
description: string   (obrigatório)
price: string          (obrigatório, somente dígitos — em centavos)
categoryId: string    (obrigatório, deve existir)
file: <arquivo>        (obrigatório, JPEG/PNG/JPG, máx. 5MB)
```

**Fluxo:** multer valida mimetype/tamanho → schema valida texto → Controller exige `req.file` → Service valida `categoryId` → upload para Cloudinary (pasta `pizzaria`) → cria produto com a `secure_url` como `banner`.

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

**Erros:** `400` validação ou nenhum arquivo enviado · `401` não autenticado · `403` não é ADMIN · `404` categoria não encontrada · `502` falha no upload (Cloudinary) · `500` mimetype não permitido ou erro inesperado

---

### `GET /products` — Listar produtos

**Middlewares:** `isAuthenticated` → `validateSchema(listProductSchema)`

**Query params:**
```
disabled: "true" | "false"   (opcional — padrão: "false")
```

Ordenados por `name` (asc). Qualquer usuário autenticado pode listar (não exige `ADMIN`).

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

**Erros:** `400` valor de `disabled` inválido · `401` não autenticado

---

### `PATCH /product` — Arquivar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(archiveProductSchema)` (role `ADMIN`)

**Query params:**
```
product_id: string   (obrigatório)
```

Atualiza `disabled: true`.

**Resposta 200:**
```json
{ "message": "Produto arquivado com sucesso" }
```

**Erros:** `400` `product_id` não enviado · `401` não autenticado · `403` não é ADMIN · `404` produto não encontrado

---

### `DELETE /product` — Deletar produto

**Middlewares:** `isAuthenticated` → `isAdmin` → `auditLog` → `validateSchema(deleteProductSchema)` (role `ADMIN`)

**Query params:**
```
product_id: string   (obrigatório)
```

**Resposta 200:**
```json
{ "message": "Produto deletado com sucesso" }
```

**Erros:** `400` `product_id` não enviado · `401` não autenticado · `403` não é ADMIN · `404` produto não encontrado

---

### `GET /category/product` — Listar produtos de uma categoria

**Middlewares:** `isAuthenticated` → `validateSchema(listProductByCategorySchema)`

**Query params:**
```
category_id: string   (obrigatório, deve existir)
```

Retorna apenas produtos não desabilitados (`disabled: false`), ordenados por `name` (asc). Não exige `ADMIN`.

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

**Erros:** `400` `category_id` não enviado · `401` não autenticado · `404` categoria não encontrada

---

## Pedidos

**Fluxo típico:** `POST /order` (rascunho, `draft: true`) → `POST /order/add` (adiciona itens) → `DELETE /order/remove` (remove item, se necessário) → `PUT /order/send` (envia p/ cozinha, `draft: false`) → `PUT /order/finish` (finaliza, `status: true`). `DELETE /order/delete` cancela o pedido em qualquer etapa.

Nenhuma rota de pedido exige role `ADMIN` — apenas `isAuthenticated`.

### `POST /order` — Criar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(createOrderSchema)`

**Body:**
```json
{ "table": 5, "name": "João Silva" }
```

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

**Erros:** `400` `table`/`name` inválidos ou ausentes · `401` não autenticado

---

### `GET /orders` — Listar pedidos

**Middlewares:** `isAuthenticated` → `validateSchema(listOrderSchema)`

**Query params:**
```
draft: "true" | "false"   (opcional — ausência ou valor diferente de "true" filtra draft = false)
```

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

**Erros:** `400` valor de `draft` inválido · `401` não autenticado

---

### `POST /order/add` — Adicionar item ao pedido

**Middlewares:** `isAuthenticated` → `validateSchema(addItemOrderSchema)`

**Body:**
```json
{ "orderId": "uuid", "productId": "uuid", "amount": 2 }
```

Valida pedido existente e produto existente/não desabilitado antes de criar o item.

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

**Erros:** `400` campos inválidos/ausentes · `401` não autenticado · `404` pedido não encontrado ou produto não encontrado

---

### `DELETE /order/remove` — Remover item do pedido

**Middlewares:** `isAuthenticated` → `validateSchema(removeItemOrderSchema)`

**Query params:**
```
itemId: string   (obrigatório)
```

**Resposta 200:**
```json
{ "message": "Item deletado com sucesso" }
```

**Erros:** `400` `itemId` não enviado · `401` não autenticado · `404` item não encontrado

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

**Erros:** `400` `orderId` não enviado · `401` não autenticado · `404` pedido não encontrado

---

### `PUT /order/send` — Enviar pedido para a cozinha

**Middlewares:** `isAuthenticated` → `validateSchema(sendOrderSchema)`

**Body:**
```json
{ "name": "João Silva", "orderId": "uuid" }
```

Atualiza `draft: false` e `name`.

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

**Erros:** `400` `name`/`orderId` inválidos ou ausentes · `401` não autenticado · `404` pedido não encontrado

---

### `PUT /order/finish` — Finalizar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(finishOrderSchema)`

**Body:**
```json
{ "orderId": "uuid" }
```

Atualiza `status: true`.

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

**Erros:** `400` `orderId` inválido/ausente · `401` não autenticado · `404` pedido não encontrado

---

### `DELETE /order/delete` — Deletar pedido

**Middlewares:** `isAuthenticated` → `validateSchema(deleteOrderSchema)`

**Query params:**
```
orderId: string   (obrigatório)
```

Remove o pedido; itens (`OrderItem`) são removidos em cascata (`onDelete: Cascade`).

**Resposta 200:**
```json
{ "message": "Pedido deletado com sucesso" }
```

**Erros:** `400` `orderId` não enviado · `401` não autenticado · `404` pedido não encontrado

---

## Códigos de erro

| Código | Quando |
|---|---|
| `400` | Validação de schema (Zod) |
| `401` | Não autenticado / credenciais inválidas |
| `403` | Autenticado mas sem permissão (não é ADMIN) |
| `404` | Recurso não encontrado |
| `409` | Conflito (e-mail já existe) |
| `429` | Muitas requisições (rate limit) — aplicado globalmente e, de forma mais restrita, em `/session` e `/users` |
| `500` | Erro inesperado do servidor |
| `502` | Falha ao integrar com serviço externo (upload Cloudinary) |

**Formato de erro de validação (Zod):**
```json
{
  "error": "Error Validation",
  "details": [
    { "field": "body.email", "message": "Email inválido" }
  ]
}
```

**Formato de erro de negócio (`AppError`):**
```json
{ "message": "Pedido não encontrado" }
```
