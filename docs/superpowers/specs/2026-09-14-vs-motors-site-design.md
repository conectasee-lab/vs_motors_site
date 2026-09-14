# VS Motors — Site institucional e vitrine de veículos

## Contexto e objetivo

A VS Motors precisa de um site que funcione como vitrine virtual de veículos em
estoque, com páginas institucionais de apoio. Este documento cobre a
**Fase 1**: navegação e telas do site público, construídas com dados
fictícios (mock), sem backend real. Uma fase futura conectará o site a um
banco de dados (Supabase) para autenticação, cadastro e persistência do
estoque via painel admin — está fora do escopo deste documento.

## Escopo da Fase 1

Construir o site público completo (frontend), navegável, com identidade
visual da marca aplicada, populado com dados de veículos mockados em código
(array/JSON local). Sem login, sem painel admin, sem escrita em banco de
dados.

### Páginas

1. **Home** — hero com CTA para o estoque, seção de veículos em destaque,
   seção institucional curta ("por que a VS Motors"), rodapé com contato.
2. **Estoque** — listagem de veículos em grid de cards, com filtros
   completos: marca, modelo, ano, faixa de preço, km, câmbio, combustível,
   cor.
3. **Detalhe do veículo** — galeria de fotos, ficha técnica completa, preço
   em destaque, botão de contato via WhatsApp (mensagem pré-preenchida
   citando o veículo).
4. **Sobre** — história da empresa, conteúdo estático (texto fixo no
   código, sem edição via painel).
5. **Venda seu carro** — formulário (marca, modelo, ano, fotos, dados de
   contato do vendedor). Nesta fase o formulário só existe na UI; envio real
   (virar lead) fica para a fase de backend.
6. **Contato** — telefone, WhatsApp, endereço, mapa, horário de
   funcionamento.

### Navegação

- Header fixo: logo à esquerda; menu (Estoque | Sobre | Venda seu Carro |
  Contato) à direita; item ativo sublinhado em vermelho; versão mobile com
  menu hambúrguer em drawer.
- Rodapé presente em todas as páginas: contato, redes sociais, endereço.

## Identidade visual

- **Paleta**: preto (`#0a0a0a`/`#121212`) como fundo principal, vermelho
  (`#c8102e` aprox.) para CTAs/destaques/estado ativo, dourado (`#d4af37`
  aprox.) como acento (bordas, ícones), branco/cinza claro para texto sobre
  fundo escuro. Exceção: o botão de WhatsApp mantém o verde característico
  do WhatsApp para reconhecimento imediato.
- **Logo**: fornecido pelo usuário — fundo preto, anéis dourado/vermelho,
  silhueta de carro dourada, texto "VS MOTORS" em vermelho.
- **Tom**: sofisticado, alto padrão, dark theme.

## Dados mockados

Os veículos de exemplo vivem em um arquivo de dados local (ex:
`data/vehicles.ts` ou `.json`) contendo campos suficientes para alimentar
listagem, filtros e página de detalhe: id, marca, modelo, ano, preço, km,
câmbio, combustível, cor, fotos (array de URLs/placeholders), descrição.
Esse arquivo é estruturado para que, na fase seguinte, os mesmos campos
mapeiem diretamente para as tabelas do Supabase — evitando retrabalho de
modelagem quando o backend for conectado.

## Arquitetura técnica

- Next.js (App Router) + TypeScript, hospedagem prevista na Vercel.
- Sem backend/banco nesta fase — toda a "persistência" é o arquivo de dados
  mockados no código.
- Filtros da página de Estoque implementados no client (filtragem sobre o
  array mockado).
- Estrutura de componentes pensada para isolar o que muda na fase seguinte:
  a origem dos dados (mock → Supabase) deve ser trocável sem reescrever as
  páginas/componentes de UI.

## Fora de escopo (fases futuras)

- Autenticação (Supabase Auth) e perfis de usuário (admin/vendedor).
- Painel admin para cadastrar/editar/remover veículos.
- Persistência real em banco de dados (Supabase/PostgreSQL).
- Envio funcional do formulário "Venda seu carro" (virar lead real).
- Upload de imagens para storage.

## Testes

Fase 1 é majoritariamente UI estática — validação principal é visual/manual
(rodar o site localmente e navegar pelas páginas). Filtros de estoque
(lógica client-side) devem ter verificação funcional básica ao serem
implementados.
