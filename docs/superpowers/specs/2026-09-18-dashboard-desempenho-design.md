# Dashboard de Desempenho — Design

Data: 2026-09-18
Autor: Carlos Eduardo (com Claude)

## Objetivo

Criar uma tela de dashboard administrativo que apresente, de forma visual e resumida:

- Quantos carros estão cadastrados em estoque.
- Quantos carros foram vendidos, com filtro de data "até".
- Valor total de faturamento (soma do preço dos carros vendidos), com o mesmo filtro de data "até".
- Listagem de todos os carros cadastrados em estoque, agrupados por marca e modelo/descrição.
- Gráfico de pizza mostrando a distribuição do estoque por marca.

## Contexto atual (levantado no repo)

- Sem ORM: acesso a dados via Supabase direto, com helpers em `lib/*.ts` (ex.: `lib/vehicles-data.ts`, `lib/brands.ts`).
- Tabela `vehicles`: estoque atual (marca via `brand_id`, `model`, `year`, `price`, etc.). Não tem status de "vendido" — ao vender, o registro é **removido** desta tabela.
- Tabela `sold_vehicles` (adicionada na commit `59b29a0`): snapshot append-only de vendas, com `brand`, `model`, `year`, `km`, `price`, `sold_at` (timestamptz, default now()). Criada explicitamente para alimentar o dashboard de vendas.
- Não existe pasta `app/dashboard` nem `app/admin/dashboard` hoje.
- Não há biblioteca de gráficos instalada (`package.json` não tem recharts/chart.js).
- Padrão de página admin: server component que chama `requireUser()` (de `lib/auth.ts`) no topo, busca dados via helper, renderiza header com título + ações (`Link` de navegação, `BackToEstoqueButton`). Não existe layout/nav compartilhado entre páginas `/admin/*` — cada página inclui seus próprios links.
- Filtros existentes (ex. `components/EstoqueFilters.tsx`) operam client-side sobre arrays já carregados; não há um componente de filtro de data reutilizável.

## Decisões (confirmadas com o usuário)

1. **Acesso**: dashboard protegido por login, reaproveitando `requireUser()` — mesmo padrão das telas `/admin/*`.
2. **Período padrão**: ao abrir a tela sem filtro explícito, "vendidos" e "faturamento" consideram o **mês atual** (baseado em `sold_at`).
3. **Escopo do filtro de data**: o filtro "até" afeta **somente** as métricas de vendas (contagem de vendidos e faturamento). A listagem de estoque agrupada e o gráfico de pizza sempre refletem o **estoque atual completo**, sem filtro de data (não fazem sentido filtrados, pois não têm data de venda).
4. **Base do gráfico de pizza**: contagem de veículos **em estoque** por marca (mesma base de dados da listagem agrupada), não a lista de marcas cadastradas na tabela `brands`.
5. **Biblioteca de gráficos**: Recharts (nova dependência).
6. **Rota**: `/admin/dashboard`, seguindo o padrão das demais telas administrativas.
7. **Descoberta do link**: adicionar um link "Dashboard" nas páginas `/admin/*` existentes (ao lado do `BackToEstoqueButton` ou equivalente), já que não há menu/nav compartilhado.
8. **Estilo visual**: cards de métrica com números grandes em destaque, ícone colorido, cantos arredondados e sombra leve — inspirado na imagem de referência fornecida pelo usuário (dashboard de CRM com cards de KPI e gráficos de pizza lado a lado). Cores seguem a paleta da marca (`brand-red` / `brand-black`) já usada no projeto, não as cores exatas da referência.

## Arquitetura

### Rota e página

- `app/admin/dashboard/page.tsx` — server component.
  - Chama `requireUser()`.
  - Lê `searchParams.ate` (string `YYYY-MM-DD` opcional) para o filtro de vendas.
  - Busca dados via `lib/dashboard-data.ts` (descrito abaixo).
  - Renderiza header (título + `BackToEstoqueButton`), os 3 cards de métrica, e as duas colunas (listagem agrupada + gráfico de pizza).
  - Passa o valor atual do filtro para um client component `DashboardDateFilter`, que atualiza a URL (`router.push`) ao mudar a data, disparando novo fetch server-side.

### Camada de dados — `lib/dashboard-data.ts`

Funções puras/assíncronas, sem estado, testáveis isoladamente:

- `getEstoqueTotal(): Promise<number>` — `count` na tabela `vehicles`.
- `getVendasResumo(ateDate: string): Promise<{ quantidade: number; faturamento: number }>` — busca linhas de `sold_vehicles` com `sold_at <= ateDate` (e `sold_at >= início do mês atual` quando nenhum filtro é passado, refletindo a decisão #2), soma `price` e conta linhas.
- `getEstoqueAgrupadoPorMarca(): Promise<{ marca: string; veiculos: { model: string; year: number; id: string }[] }[]>` — busca `vehicles` com join em `brands`, agrupa em memória por nome da marca, ordenado alfabeticamente.
- `getEstoquePorMarcaParaGrafico(): Promise<{ marca: string; quantidade: number }[]>` — reaproveita o mesmo resultado de `getEstoqueAgrupadoPorMarca` (ou uma query equivalente) apenas contando por marca.

Funções de agregação puras (recebendo arrays já carregados) ficam separadas das funções que chamam o Supabase, para permitir teste unitário sem mock de rede — mesmo padrão de separação já usado em `lib/vehicles.ts` (`filterVehicles`) vs. `lib/vehicles-data.ts` (fetch).

### Componentes de UI

- `components/dashboard/MetricCard.tsx` — card reutilizável: ícone, rótulo, valor grande, cor de destaque. Usado 3x (Estoque, Vendidos, Faturamento).
- `components/dashboard/DashboardDateFilter.tsx` — client component, input de data "até", atualiza query string.
- `components/dashboard/EstoquePorMarcaLista.tsx` — lista/acordeão agrupado por marca → modelos.
- `components/dashboard/EstoquePorMarcaPizza.tsx` — client component envolvendo o `PieChart` do Recharts (Recharts exige client component).

### Formatação

- Faturamento formatado como moeda BRL (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).

## Tratamento de erros e estados vazios

- Estoque vazio: `MetricCard` mostra "0" normalmente; listagem e gráfico mostram mensagem "Nenhum veículo em estoque" (mesmo padrão usado em `MarcasPage` quando `brands.length === 0`).
- Nenhuma venda no período filtrado: cards de "Vendidos" e "Faturamento" mostram "0" / "R$ 0,00", sem mensagem de erro.
- Falha ao consultar Supabase: erro propaga para o `error.tsx` padrão do segmento Next.js (consistente com o restante do projeto, que não tem tratamento especial de erro nas páginas admin).
- Filtro de data ausente/inválido: `DashboardDateFilter` normaliza para o mês atual antes de montar a query string.

## Testes

- `lib/dashboard-data.test.ts`: testes unitários das funções de agregação pura (contagem, soma de faturamento, agrupamento por marca/modelo), seguindo o padrão de `app/admin/marcas/actions.test.ts`. Sem necessidade de mockar Supabase para essas funções puras; funções que chamam o Supabase diretamente ficam finas (apenas fetch + delegam agregação).

## Fora de escopo

- Alterar o comportamento de `markVehicleAsSoldAction` ou a estrutura da tabela `sold_vehicles`.
- Criar um layout/nav compartilhado para `/admin/*` (fica restrito a adicionar links pontuais nas páginas existentes).
- Filtro de data para a listagem/gráfico de estoque (decisão #3).
- Exportação de relatórios (PDF/Excel) — não foi solicitado.
