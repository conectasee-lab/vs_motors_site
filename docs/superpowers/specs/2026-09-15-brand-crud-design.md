# CRUD de marcas de veículos — Design

## Contexto e objetivo

Hoje o campo "marca" do veículo ([lib/vehicles.ts](../../../lib/vehicles.ts)) é texto livre digitado no formulário de cadastro ([components/VehicleForm.tsx](../../../components/VehicleForm.tsx)), sem nenhum controle sobre valores repetidos, grafia ou logotipo. O objetivo desta feature é transformar marca em uma entidade própria, com nome e imagem (logo), gerenciável por um CRUD interno, e vincular o cadastro de veículo a essa entidade em vez de um texto livre.

## Decisões confirmadas com o usuário

- Qualquer usuário autenticado (funcionário ou admin) pode gerenciar marcas — mesmo nível de acesso já usado para o cadastro de veículos, sem distinção de papéis.
- Não há migração automática dos valores de `brand` (texto) já existentes: a tabela de marcas começa vazia; veículos existentes ficam com marca não vinculada até serem reeditados manualmente.
- No formulário de veículo, a marca é escolhida por um `<select>` simples (nome da marca); o logo é exibido depois, no card/detalhe do veículo — não dentro do próprio select.

## Arquitetura

- **Banco de dados:** nova tabela `brands` no Supabase Postgres.
- **Armazenamento de imagem:** novo bucket do Supabase Storage `brand-logos`, seguindo o mesmo padrão já usado para `vehicle-photos`.
- **Vínculo com veículos:** a coluna `vehicles.brand` (texto) é substituída por `vehicles.brand_id` (uuid, FK para `brands.id`, nullable).

## Modelo de dados

```sql
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table vehicles
  drop column brand,
  add column brand_id uuid references brands(id);
```

- `logo_url` é nullable: uma marca pode ser cadastrada sem imagem.
- `name` é `unique` para evitar duplicidade (ex.: "Fiat" cadastrada duas vezes).
- `vehicles.brand_id` é nullable e usa `on delete` padrão (restrict) — ver seção de exclusão abaixo.

## RLS e Storage

Mesmo padrão já aplicado a `vehicles`/`vehicle-photos`:

- Tabela `brands`: leitura pública (`select` sem restrição, necessário para a página pública `/estoque` exibir marca/logo); `insert`/`update`/`delete` exigem `auth.role() = 'authenticated'`.
- Bucket `brand-logos`: bucket público; políticas de storage.objects espelhando as de `vehicle-photos` (select público; insert/update/delete só autenticado, escopadas a `bucket_id = 'brand-logos'`).

## CRUD de marcas

- Nova rota `app/admin/marcas/`:
  - `page.tsx`: lista de marcas (nome + miniatura do logo), com ações de editar/excluir, e link para cadastrar nova.
  - `nova/page.tsx`: formulário de criação (nome + upload de imagem).
  - `[id]/editar/page.tsx`: formulário de edição, pré-preenchido, com opção de trocar a imagem ou excluir a marca.
- `app/admin/marcas/actions.ts` com server actions, seguindo o esqueleto de [app/estoque/actions.ts](../../../app/estoque/actions.ts):
  - `createBrandAction`: valida nome obrigatório e não duplicado, faz upload da imagem (se enviada) para `brand-logos`, insere a linha.
  - `updateBrandAction`: mesma validação; se nova imagem for enviada, substitui `logo_url` (mantendo a antiga só se nenhuma nova for enviada).
  - `deleteBrandAction`: antes de excluir, verifica se algum veículo referencia essa marca (`brand_id`); se houver, retorna erro impedindo a exclusão ("Marca em uso por N veículo(s), remova o vínculo antes de excluir").
- Todas as três exigem `requireUser()`, igual às actions de veículo.
- Link para `/admin/marcas` adicionado à navegação administrativa existente (ao lado do link de gerenciar usuários).

## Integração no cadastro de veículo

- `lib/vehicles.ts`: tipo `Vehicle` passa a ter `brand: { id: string; name: string; logoUrl: string | null } | null` (vindo de um `select` com join, ex. `select("*, brand:brands(id, name, logo_url)")`) em vez de `brand: string`. `VehicleFilters.brand` passa a filtrar por `brand_id`.
- `components/VehicleForm.tsx`: campo "Marca" passa de `<input name="brand">` para `<select name="brand_id">`, populado com a lista de marcas (buscada no server component da página que renderiza o form). Opção vazia inicial ("Selecione uma marca") permite salvar veículo sem marca vinculada.
- `app/estoque/actions.ts`: `parseVehicleFields`/`validateVehicleFields` passam a tratar `brand_id` (string ou vazio) em vez de `brand` (texto); `brand_id` vazio é salvo como `null`.
- `components/VehicleCard.tsx` e `components/EstoqueFilters.tsx`: exibem `vehicle.brand?.name` e, quando houver, o logo (`vehicle.brand?.logoUrl`) ao lado do nome.

## Tratamento de erros

- Nome de marca vazio ou duplicado: erro inline no formulário, sem perder os dados já digitados.
- Falha de upload do logo: mensagem específica ("Falha ao enviar logo: ..."), sem impedir que nome/marca já validados sejam reaproveitados ao corrigir e reenviar.
- Exclusão de marca em uso: bloqueada com mensagem explicando quantos veículos referenciam a marca.
- Veículo sem marca vinculada (`brand_id` null): card/detalhe do veículo exibe apenas o nome do modelo, sem quebrar por falta de marca.

## Testes

- Novo `app/admin/marcas/actions.test.ts`: cobre criação, edição, validação de nome duplicado/vazio, e bloqueio de exclusão quando a marca está em uso.
- Ajuste em [lib/vehicles.test.ts](../../../lib/vehicles.test.ts) e [app/estoque/actions.test.ts](../../../app/estoque/actions.test.ts) para refletir `brand_id`/objeto `brand` em vez do texto livre.

## Fora de escopo (não incluído nesta feature)

- Migração automática dos valores de texto já cadastrados em `vehicles.brand` para a nova tabela `brands`.
- Distinção de papéis/permissões entre quem pode gerenciar marcas (todos os usuários autenticados têm o mesmo acesso, igual ao restante do sistema hoje).
- Edição em massa de veículos para reatribuir marca (reatribuição é feita um a um, pela tela de edição já existente).
