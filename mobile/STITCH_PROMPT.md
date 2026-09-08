# Prompt para o Stitch — App do Garçom (AS Pizzaria)

Cole o texto abaixo no [Stitch](https://stitch.withgoogle.com) (modo **Mobile**). Ele reaproveita a
identidade visual do dashboard web (`frontend/src/app/globals.css`): base neutra cinza-ardósia,
destaque em âmbar, cantos arredondados ~10px, tema claro e escuro.

> Dica: se o prompt ficar longo demais para uma geração só, gere primeiro o **design system + Login + Cardápio**
> e depois peça as telas restantes citando "mesma identidade visual das telas anteriores".

---

## Prompt

```
Crie o design de um aplicativo mobile (iOS e Android) chamado "AS Pizzaria — Garçom".
É um app de uso interno: o garçom anota o pedido do cliente na mesa e envia para a cozinha.
Todo o texto da interface deve estar em português do Brasil.

IDENTIDADE VISUAL (obrigatória em todas as telas)
- Estética: limpa, moderna, muito espaço em branco, composição editorial, sem aparência de template SaaS.
- Cantos arredondados de 10px em cards, inputs e botões. Sombras muito suaves. Microinterações discretas.
- Tipografia sans-serif geométrica (estilo Geist ou Inter). Valores de preço podem usar fonte monoespaçada.
- Marca exibida como "AS Pizzaria", com a palavra "Pizzaria" na cor âmbar.
- Suporte a tema claro e escuro.

PALETA — TEMA CLARO
- Fundo da tela: #FFFFFF
- Texto principal: #0E1214 (quase preto, levemente azulado)
- Texto secundário / legendas: #6C7A80
- Cartões e superfícies: #F6F7F7
- Bordas e divisórias: #E6E9EA
- Cor primária (botões sólidos escuros, cabeçalhos): #1F2528 com texto branco
- COR DE DESTAQUE (âmbar): #F59E0B — usada no CTA principal de cada tela, em preços, no item de
  navegação ativo e em selos de status. Estado pressionado: #D97706.
- Erro / ação destrutiva: #DC2626

PALETA — TEMA ESCURO
- Fundo da tela: #0E1214
- Cartões e superfícies: #1F2528
- Texto principal: #F7F9F9 (quase branco) / secundário: #A9B4B8
- Bordas: branco a 10% de opacidade
- Destaque âmbar no escuro: #FBBF24

NAVEGAÇÃO
- Barra de abas inferior com 3 itens: "Cardápio", "Comandas", "Perfil".
  Ícone + rótulo. Aba ativa em âmbar, inativas em cinza secundário.
- Cabeçalho branco translúcido com leve sombra ao rolar.

TELAS A GERAR

1. LOGIN
   - Card centralizado sobre fundo claro. Título "AS Pizzaria" ("Pizzaria" em âmbar).
   - Subtítulo: "Entre com a conta fornecida pelo gerente".
   - Campos: "Email" e "Senha" (com botão de mostrar/ocultar senha à direita).
   - Botão primário largura total, âmbar: "Entrar".
   - Área de mensagem de erro em vermelho suave abaixo do botão.
   - Sem link de "criar conta" (não há autocadastro).

2. CARDÁPIO (aba 1)
   - Cabeçalho "Cardápio" e campo de busca.
   - Chips horizontais roláveis com as categorias (ex.: "Pizzas", "Bebidas", "Sobremesas"); chip ativo em âmbar.
   - Lista de produtos em cards: miniatura da imagem à esquerda, nome em negrito, descrição em 1–2 linhas
     em cinza, e o preço em âmbar à direita (ex.: "R$ 45,00"). Botão "+" circular âmbar no canto do card.
   - Botão flutuante inferior direito: "Nova comanda" (âmbar, com ícone de +).

3. NOVA COMANDA
   - Título "Abrir comanda".
   - Campo numérico "Mesa" (teclado numérico) e campo de texto "Nome do cliente".
   - Botão primário âmbar: "Abrir comanda".

4. COMANDA (detalhe do pedido)
   - Cabeçalho com "Mesa 5 · Ana" e um selo de status âmbar "Rascunho".
   - Lista de itens: nome do produto, controle de quantidade (- valor +), preço da linha, ícone de lixeira.
   - Rodapé fixo: linha "Total" com o valor em destaque e botão primário âmbar largura total
     "Enviar para a cozinha". Botão secundário de contorno: "Adicionar item".
   - Estado vazio: ilustração simples + "Nenhum item ainda. Toque em Adicionar item."

5. ADICIONAR ITEM (folha modal que sobe de baixo)
   - Busca rápida + lista de produtos (mesmo card do cardápio, mais compacto).
   - Ao escolher um produto: seletor de quantidade grande (- N +) e botão âmbar "Adicionar à comanda".

6. COMANDAS (aba 2)
   - Título "Comandas abertas".
   - Lista de cards de comandas em rascunho: "Mesa 5 · Ana", nº de itens, horário, seta.
   - Puxar para atualizar.
   - Estado vazio: "Nenhuma comanda aberta."

7. PEDIDO ENVIADO (confirmação)
   - Tela central com ícone de check em círculo âmbar, "Comanda enviada para a cozinha",
     e dois botões: primário "Nova comanda" e texto "Voltar ao cardápio".

8. PERFIL (aba 3)
   - Avatar com iniciais, nome do garçom, e-mail, selo "Atendente".
   - Item de lista "Sair" em vermelho.

ACESSIBILIDADE
- Alvos de toque de no mínimo 44px, foco visível, bom contraste em ambos os temas,
  sem overflow horizontal.
```
