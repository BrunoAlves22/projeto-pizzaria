# App do Garçom — Pizzaria

App mobile onde o **garçom anota o pedido do cliente na mesa** e **envia para a cozinha**. Os pedidos enviados aparecem no **dashboard web** (`../frontend`), que faz polling na API. Este app consome a mesma API REST do backend (`../backend`).

Leia antes: [`../PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) e [`../backend/PROJECT_CONTEXT.md`](../backend/PROJECT_CONTEXT.md).
Para o design das telas: [`STITCH_PROMPT.md`](STITCH_PROMPT.md) (prompt pronto para o Stitch, reaproveitando a identidade do dashboard).

> **Estado atual:** o scaffold já existe — `create-expo-app` (Expo SDK 57, `expo-router`, TypeScript, template padrão de _tabs_). O código do router fica em **`src/app/`** e o alias `@/*` aponta para `src/*`. Rodar: `npm install` e `npm start` (ou `npm run android` / `npm run ios` / `npm run web`). O conteúdo de `src/app/` e `src/components/` ainda é o exemplo do template — substituir seguindo este guia. Ainda **não** instalados: `expo-secure-store`, `@tanstack/react-query`, `react-hook-form`, `zod`.

---

## 1. O que o app faz

| Ação | Tela | Endpoint(s) |
|---|---|---|
| Entrar | Login | `POST /session` (conta criada pelo gerente; não há autocadastro) |
| Ver o cardápio | Cardápio | `GET /category-list`, `GET /products` |
| Abrir uma comanda para a mesa | Nova comanda | `POST /order` |
| Adicionar/remover itens | Comanda | `POST /order/add`, `DELETE /order/remove` |
| Conferir a comanda | Comanda | `GET /order/detail` |
| Enviar para a cozinha | Comanda | `PUT /order/send` |
| Ver rascunhos abertos | Comandas | `GET /orders?draft=true` |
| Sair | Perfil | `POST /logout` |

**Fora do escopo do app** (é a cozinha/dashboard quem faz): `PUT /order/finish`, `DELETE /order/delete`.

### Fluxo de uma comanda

```
Login ──▶ Cardápio ──▶ "Nova comanda" (mesa + nome do cliente)
                              │  POST /order  → orderId, draft:true
                              ▼
                        Tela da Comanda
              ┌───────────────┼───────────────┐
      POST /order/add   DELETE /order/remove   GET /order/detail
     (produto + qtd)      (itemId)              (revisar)
                              │
                              ▼
                    "Enviar para a cozinha"
                     PUT /order/send  → draft:false
                              │
                              ▼
              Aparece no dashboard da cozinha
```

Regras que o app precisa respeitar:
- `price` vem em **centavos** (inteiro). Exibir `price / 100` em `R$`.
- Ao adicionar o **mesmo produto** duas vezes na comanda, a API **soma a quantidade** na mesma linha (não cria linha nova). O app deve refletir isso relendo o detalhe ou usando a resposta do `add`.
- Produtos com `disabled: true` **não** podem ser pedidos (a API rejeita com 404). Não exibi-los.
- Só é possível `send` com pelo menos 1 item (validar no app; a API não impede comanda vazia, mas não faz sentido enviar).

---

## 2. Stack recomendada

- **React Native + Expo** (SDK atual), **TypeScript**.
- **Expo Router** para navegação (file-based, como o Next.js do dashboard).
- **expo-secure-store** para guardar o JWT (Keychain/Keystore — **não** usar AsyncStorage para o token).
- **@tanstack/react-query** para chamadas à API, cache e refetch.
- **React Hook Form + Zod** para os formulários (login, nova comanda). O Zod pode espelhar os schemas do backend em `../backend/src/schemas`.
- UI: componentes próprios + `@expo/vector-icons`. (Opcional: `nativewind` para Tailwind, alinhando com o dashboard.)

> Alternativa sem Expo: React Native CLI + `react-native-keychain` + `@react-navigation/native`. O restante do guia continua válido.

---

## 3. Estrutura de pastas

O scaffold já traz `src/app/` (router), `src/components/`, `src/hooks/`, `src/constants/theme.ts`
e `src/global.css` com o exemplo do template. Alvo depois de adaptar:

```
mobile/
├── app.json
├── .env                          # EXPO_PUBLIC_API_URL — não commitar
└── src/
    ├── app/                      # Expo Router (fica em src/, não na raiz)
    │   ├── _layout.tsx           # Providers (QueryClient), guarda de auth
    │   ├── login.tsx
    │   └── (app)/
    │       ├── _layout.tsx       # Tabs: Cardápio | Comandas | Perfil
    │       ├── index.tsx         # Cardápio
    │       ├── orders.tsx        # Comandas em rascunho (GET /orders?draft=true)
    │       ├── order/[id].tsx    # Tela da comanda (itens + enviar)
    │       ├── new-order.tsx     # Form: mesa + nome do cliente
    │       └── profile.tsx       # Usuário logado + sair
    ├── api/
    │   ├── client.ts             # fetch wrapper + baseURL + Authorization
    │   ├── auth.ts               # login, logout, me
    │   ├── catalog.ts            # categorias, produtos
    │   └── orders.ts             # create, addItem, removeItem, detail, send, list
    ├── auth/
    │   ├── token.ts              # secure-store get/set/delete
    │   └── AuthContext.tsx
    ├── lib/
    │   ├── money.ts              # formatBRL(centavos)
    │   └── types.ts              # User, Category, Product, Order, OrderItem
    └── components/               # ProductCard, QuantityStepper, OrderItemRow...
```

O alias `@/*` resolve para `src/*` (ex.: `@/api/client`, `@/auth/token`).
Os tipos de `src/lib/types.ts` podem ser copiados de [`../frontend/src/lib/types.ts`](../frontend/src/lib/types.ts).

---

## 4. Configuração

### `.env` (via `app.config.ts` / `expo-constants`)

```
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333
```

- Em dispositivo físico, **não** use `localhost` — use o IP da máquina que roda a API na rede local (ou um túnel).
- Emulador Android: `http://10.0.2.2:3333`. Simulador iOS: `http://localhost:3333`.
- Produção: URL pública **HTTPS** da API.

### CORS / rede

- App nativo **não** usa CORS (não há navegador), então `CORS_ORIGIN` do backend não afeta o app.
- Android bloqueia HTTP puro por padrão (cleartext). Em dev, habilite cleartext para o IP local no `app.json` (`android.usesCleartextTraffic` ou `expo-build-properties`); em produção use HTTPS.

---

## 5. Cliente HTTP

`src/api/client.ts`:

```ts
import { getToken } from "@/auth/token";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: { field: string; message: string }[],
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };
  if (!(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = await getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, body, headers: finalHeaders });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(
      data?.message || data?.details?.[0]?.message || `Erro ${res.status}`,
      res.status,
      data?.details,
    );
  }
  // 200 com corpo JSON em todas as rotas usadas pelo app
  return res.json() as Promise<T>;
}
```

Tratamento global: se `status === 401` em qualquer chamada autenticada → limpar o token e mandar para `login` (sessão expirada ou revogada por `/logout`).

---

## 6. Autenticação

### Login — `POST /session`

Request:
```json
{ "email": "garcom@pizzaria.com", "password": "Senha123" }
```
Response `200`:
```json
{ "id": "uuid", "name": "João", "email": "garcom@pizzaria.com", "role": "STAFF", "token": "eyJ..." }
```
Erros: `400` validação, `401` credenciais inválidas, `429` muitas tentativas.

Guardar `token` com `expo-secure-store`. Guardar `id/name/role` em memória/contexto (ou rechamar `GET /me`).

### Sessão

- `GET /me` (Bearer) → `{ id, name, email, createdAt }`. Usar no boot do app para validar o token guardado.
- O token expira em **1 dia**. Não há refresh token — ao receber `401`, deslogar e pedir login de novo.

### Logout — `POST /logout` (Bearer)

Chamar o endpoint (invalida no servidor via `tokenVersion`), depois apagar o token do secure-store e navegar para `login`. Se a chamada falhar (offline), apagar o token localmente mesmo assim.

### Cadastro

`POST /users` é **restrito a ADMIN** — o gerente cria as contas dos garçons pelo dashboard web (ou via seed). **O app não tem tela de cadastro.** O garçom só faz login com a conta que recebeu.

---

## 7. Cardápio

### Categorias — `GET /category-list` (Bearer)

```json
[ { "id": "uuid", "name": "Pizzas", "createdAt": "..." } ]
```

### Produtos — `GET /products?disabled=false` (Bearer)

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
    "createdAt": "..."
  }
]
```

Alternativa por categoria: `GET /category/product?category_id=<uuid>` (só retorna `disabled: false`).

Sugestão de UI: lista de produtos agrupada por categoria (abas ou seções). Cache com React Query (`staleTime` de alguns minutos; cardápio muda pouco).

---

## 8. Comanda

### 8.1 Criar — `POST /order` (Bearer)

Request:
```json
{ "table": 5, "name": "Mesa da Ana" }
```
- `table`: inteiro positivo (número da mesa).
- `name`: texto não vazio (nome do cliente ou identificação da mesa).

Response `201`:
```json
{ "id": "uuid", "table": 5, "name": "Mesa da Ana", "status": false, "draft": true, "createdAt": "..." }
```

Guardar o `id` retornado e navegar para `order/[id]`.

### 8.2 Adicionar item — `POST /order/add` (Bearer)

Request:
```json
{ "orderId": "uuid", "productId": "uuid", "amount": 2 }
```
- `amount`: inteiro positivo.
- Se o produto já está na comanda, a API **incrementa** a linha existente e retorna a linha atualizada.

Response `201`:
```json
{
  "id": "uuid",
  "amount": 2,
  "orderId": "uuid",
  "productId": "uuid",
  "createdAt": "...",
  "product": { "id": "uuid", "name": "Pizza Calabresa", "price": 4500, "description": "...", "banner": "..." }
}
```
Erros: `404` pedido não encontrado, `404` produto não encontrado/desabilitado.

### 8.3 Remover item — `DELETE /order/remove?itemId=<uuid>` (Bearer)

Remove a **linha inteira** (não decrementa). Para "diminuir em 1", o app precisa remover a linha e re-adicionar com a quantidade nova, ou apenas oferecer "remover item".

Response `200`: `{ "message": "Item deletado com sucesso" }`. Erro `404` item não encontrado.

### 8.4 Detalhar — `GET /order/detail?orderId=<uuid>` (Bearer)

```json
{
  "id": "uuid",
  "table": 5,
  "name": "Mesa da Ana",
  "draft": true,
  "status": false,
  "createdAt": "...",
  "orderItems": [
    { "id": "uuid", "amount": 2, "product": { "id": "uuid", "name": "Pizza Calabresa", "description": "...", "price": 4500, "banner": "..." } }
  ]
}
```

Fonte de verdade da tela da comanda. Total = `Σ (item.amount * item.product.price)` / 100.

### 8.5 Enviar para a cozinha — `PUT /order/send` (Bearer)

Request:
```json
{ "orderId": "uuid", "name": "Mesa da Ana" }
```
Response `200`: pedido com `draft: false`. A partir daí aparece no dashboard da cozinha.

Depois de enviar: o app pode voltar para o cardápio e/ou mostrar "Comanda enviada". O app **não** finaliza nem cancela.

### 8.6 Listar rascunhos — `GET /orders?draft=true` (Bearer)

Lista as comandas ainda não enviadas (com `orderItems` embutidos). Útil para o garçom retomar uma comanda aberta. `?draft=false` traria as já enviadas (visão da cozinha — normalmente não usada no app).

---

## 9. Estados, erros e offline

- **401** em rota autenticada → deslogar + ir para login.
- **429** → mensagem "Muitas tentativas, aguarde" e desabilitar o botão por alguns segundos.
- **400** → mostrar `details[0].message` no campo correspondente.
- **404** ao adicionar item → produto pode ter sido arquivado; recarregar o cardápio.
- **Sem rede / 5xx** → toast "Sem conexão com o servidor", permitir retry. Não perder o rascunho local: manter os itens escolhidos em estado até o `add` confirmar.
- Rate limit por IP: numa loja com vários celulares no mesmo Wi-Fi, todos compartilham o IP. Evitar polling agressivo no app; preferir refetch sob ação do usuário / pull-to-refresh.
- Renderizar `name` do pedido e `name`/`description` do produto **como texto** (`<Text>`), nunca como HTML.

---

## 10. Passo a passo de construção

1. **Scaffold** — ✅ feito (`create-expo-app`, Expo SDK 57). Falta: `npm i expo-secure-store @tanstack/react-query react-hook-form zod`, criar `.env` com `EXPO_PUBLIC_API_URL`, e limpar o exemplo de `src/app/` e `src/components/`.
2. **Tipos e cliente HTTP**: copiar `types.ts` do frontend; implementar `src/api/client.ts` (seção 5).
3. **Auth**: `token.ts` (secure-store), `AuthContext`, tela de `login`, guarda no `src/app/_layout.tsx` (sem token → `login`; com token válido via `GET /me` → `(app)`).
4. **Cardápio**: `GET /category-list` + `GET /products`; `ProductCard` com preço formatado; agrupar por categoria.
5. **Nova comanda**: form `mesa` + `nome` → `POST /order` → navegar para `order/[id]`.
6. **Tela da comanda**: `GET /order/detail`; adicionar item (seleção de produto + `QuantityStepper` → `POST /order/add`); remover linha (`DELETE /order/remove`); total; botão **Enviar** (`PUT /order/send`), desabilitado se sem itens.
7. **Comandas abertas**: `GET /orders?draft=true` com pull-to-refresh; tocar abre `order/[id]`.
8. **Perfil**: nome do usuário + **Sair** (`POST /logout` + limpar token).
9. **Tratamento global de erro** (seção 9) e loading states (skeletons).
10. **Testar o fluxo completo** contra a API local e conferir o pedido chegando no dashboard (`http://localhost:3000`).

---

## 11. Critérios de aceite

- [ ] Login com conta `STAFF` funciona; token guardado no secure-store; `401` desloga automaticamente.
- [ ] Cardápio lista só produtos ativos, agrupados por categoria, com preço em `R$` correto (centavos → reais).
- [ ] Criar comanda com mesa + nome retorna `orderId` e abre a tela da comanda.
- [ ] Adicionar o mesmo produto duas vezes resulta numa única linha com a quantidade somada.
- [ ] Remover item atualiza a comanda e o total.
- [ ] "Enviar para a cozinha" muda o pedido para `draft: false` e ele aparece no dashboard web.
- [ ] Comandas em rascunho podem ser retomadas.
- [ ] App não expõe finalizar/cancelar pedido nem cadastro de produto/categoria/usuário.
- [ ] Erros de rede, `400`, `429` e `404` têm mensagem clara e não quebram a tela.
- [ ] Nenhum segredo no código; `EXPO_PUBLIC_API_URL` via env; `.env` fora do controle de versão.
