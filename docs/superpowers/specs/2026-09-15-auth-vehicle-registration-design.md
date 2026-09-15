# Login de funcionários e cadastro de veículos — Design

## Contexto e objetivo

Hoje o estoque de veículos é um array fixo em código ([lib/vehicles.ts](../../../lib/vehicles.ts)) — qualquer alteração exige editar código e fazer novo deploy. O objetivo desta feature é permitir que funcionários da loja (até 10 pessoas) façam login com e-mail/senha e cadastrem, editem e excluam veículos do estoque diretamente pelo site, com fotos enviadas do computador ou celular, sem abrir essa possibilidade para o público.

## Restrições descobertas

- A hospedagem atual na Hostinger é compartilhada e só suporta PHP — não roda Node.js. O site (Next.js) precisa ser hospedado em um serviço que suporte Node.js/Next.js nativamente.
- Não deve existir tela pública de criação de conta. Contas de funcionário são sempre criadas manualmente pelo dono/admin.
- Não é necessária verificação em duas etapas (2FA); proteção básica contra força bruta é suficiente.
- Qualquer funcionário logado pode cadastrar, editar e excluir qualquer veículo — sem distinção por autor.

## Arquitetura

- **Hospedagem do site:** Vercel (gratuito), que hospeda o Next.js nativamente (SSR, rotas de API, etc.). A Hostinger passa a ser usada apenas para o domínio (DNS apontando para a Vercel).
- **Autenticação:** Supabase Auth, usando login por e-mail/senha. Não existe endpoint público de cadastro de conta — usuários são criados pelo painel do Supabase ou por uma tela interna de "gerenciar usuários" acessível apenas a quem já está logado.
- **Banco de dados:** Supabase Postgres, substituindo o array fixo em `lib/vehicles.ts`. Uma tabela `vehicles` guarda os dados do estoque; os campos seguem o tipo `Vehicle` já existente (marca, modelo, ano, preço, km, câmbio, combustível, cor, descrição) mais uma lista de URLs de imagens.
- **Armazenamento de imagens:** Supabase Storage. Cada veículo pode ter até 14 fotos, enviadas diretamente do formulário de cadastro/edição (upload de arquivo, não link colado).

## Autenticação e proteção contra acesso indevido

- Nova rota `/login`: formulário de e-mail + senha, sem link de "criar conta".
- Sessão gerenciada pelo Supabase Auth via cookie httpOnly (não acessível por JavaScript malicioso no navegador).
- Rotas administrativas protegidas por middleware do Next.js: `/estoque/novo`, `/estoque/[id]/editar`, e a tela de gerenciar usuários exigem sessão válida; usuário não autenticado é redirecionado para `/login`.
- Proteção contra força bruta: o Supabase Auth já limita tentativas de login repetidas por e-mail/IP; o front-end exibe mensagem apropriada ("muitas tentativas, aguarde alguns minutos") quando isso ocorre.
- Política de senha: mínimo de caracteres exigido na criação da conta (definido no painel do Supabase), sem necessidade de regras adicionais customizadas.
- Sem 2FA, conforme decisão do usuário.

## Gerenciamento de usuários

- Tela interna (acessível só a quem está logado) para o dono/admin criar novos funcionários e redefinir senhas, evitando depender de acesso direto ao painel do Supabase no dia a dia.
- Não há diferenciação de papéis (admin vs funcionário comum) além de quem consegue acessar essa tela — item que pode ser refinado depois, se necessário.

## Cadastro de veículos

- Tela `/estoque/novo`: formulário com os campos já existentes no tipo `Vehicle` (marca, modelo, ano, preço, km, câmbio, combustível, cor, descrição) mais upload de fotos.
- Tela `/estoque/[id]/editar`: mesmo formulário, pré-preenchido, permitindo alterar dados e fotos, ou excluir o veículo.
- Qualquer funcionário logado pode criar, editar ou excluir qualquer veículo, sem restrição por autor.
- A página pública `/estoque` e a home continuam sem exigir login — só as telas de cadastro/edição/gerência são protegidas.

## Upload de imagens

- Até 14 fotos por veículo.
- Tipos de arquivo aceitos: jpg, png, webp.
- Tamanho máximo por foto definido para evitar uploads acidentais de arquivos muito grandes (ex: 5MB por foto).
- Fotos são enviadas ao Supabase Storage; a tabela `vehicles` guarda apenas as URLs resultantes.

## Tratamento de erros

- Login com credenciais inválidas: mensagem clara, sem revelar se o e-mail existe ou não.
- Excesso de tentativas de login: mensagem de bloqueio temporário.
- Formulário de cadastro: validação de campos obrigatórios, limite de 14 fotos, tipos/tamanho de arquivo — erros exibidos inline, sem derrubar a página.
- Falha de upload de foto: mensagem de erro específica, sem perder o restante dos dados já preenchidos no formulário.

## Testes

- Mantidos e adaptados os testes existentes de filtro de veículos ([lib/vehicles.test.ts](../../../lib/vehicles.test.ts)) para a nova fonte de dados (Supabase).
- Novos testes cobrindo:
  - Acesso negado a rotas administrativas sem sessão válida (redirecionamento para `/login`).
  - Validação de limite de 14 fotos e tipos de arquivo no formulário de cadastro.
  - Bloqueio de login após múltiplas tentativas com senha incorreta.

## Fora de escopo (não incluído nesta feature)

- Verificação em duas etapas (2FA).
- Diferenciação de papéis/permissões entre funcionários (todos têm o mesmo nível de acesso).
- Tela pública de cadastro de conta ou recuperação de senha self-service (redefinição de senha, por ora, é feita pelo admin).
- Migração do domínio na Hostinger para apontar para a Vercel (passo de infraestrutura fora do código, a ser feito separadamente pelo usuário).
