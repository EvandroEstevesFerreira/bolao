-- Bolão Sistenge Copa 2026 — Schema completo

-- SELEÇÕES (48 times)
create table selecoes (
  id int primary key,
  nome text not null,
  codigo_fifa char(3),
  bandeira_url text,
  grupo char(1)
);

-- PERFIL DO USUÁRIO
create table perfis (
  id uuid primary key default gen_random_uuid(),
  cpf char(11) unique not null,
  nome text not null,
  nickname text unique not null,
  pin_hash text,
  avatar_url text,
  setor_cr text,
  selecao_favorita_id int references selecoes(id),
  ativo boolean default true,
  is_admin boolean default false,
  criado_em timestamptz default now()
);

-- BOLÕES
create table boloes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  codigo_convite text unique not null,
  organizador_id uuid references perfis(id),
  valor_inscricao numeric(10,2) default 0,
  valor_arrecadado numeric(12,2) default 0,
  premiacao_texto text,
  publico boolean default false,
  criado_em timestamptz default now()
);

-- CONVITES
create table convites (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  cpf char(11),
  bolao_id uuid references boloes(id) on delete cascade,
  usado_em timestamptz,
  expira_em timestamptz,
  criado_por uuid references perfis(id),
  criado_em timestamptz default now()
);

-- PARTIDAS (104 jogos)
create table partidas (
  id bigint primary key,
  rodada text,
  fase text not null,
  grupo char(1),
  data_hora timestamptz not null,
  selecao_casa_id int references selecoes(id),
  selecao_fora_id int references selecoes(id),
  placar_casa int,
  placar_fora int,
  placar_casa_prorrogacao int,
  placar_fora_prorrogacao int,
  decidido_penaltis boolean default false,
  estadio text,
  cidade text,
  status text not null default 'agendado',
  atualizado_em timestamptz default now()
);

-- REGRAS DE PREMIAÇÃO
create table premiacao_regras (
  bolao_id uuid references boloes(id) on delete cascade,
  posicao int not null,
  percentual numeric(5,2) not null,
  primary key (bolao_id, posicao)
);

-- PARTICIPAÇÃO EM BOLÕES
create table bolao_participantes (
  bolao_id uuid references boloes(id) on delete cascade,
  usuario_id uuid references perfis(id) on delete cascade,
  papel text default 'jogador',
  valor_pago numeric(10,2) default 0,
  pago boolean default false,
  data_pagamento timestamptz,
  entrou_em timestamptz default now(),
  primary key (bolao_id, usuario_id)
);

-- PALPITES DE PLACAR
create table palpites (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfis(id) on delete cascade,
  partida_id bigint references partidas(id) on delete cascade,
  placar_casa int not null,
  placar_fora int not null,
  pontos int default 0,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (usuario_id, partida_id)
);

-- PALPITES BÔNUS
create table palpites_bonus (
  usuario_id uuid references perfis(id) on delete cascade,
  bolao_id uuid references boloes(id) on delete cascade,
  campeao_id int references selecoes(id),
  vice_id int references selecoes(id),
  pontos int default 0,
  primary key (usuario_id, bolao_id)
);

-- CONQUISTAS / BADGES
create table conquistas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfis(id) on delete cascade,
  tipo text not null,
  partida_id bigint references partidas(id),
  ganho_em timestamptz default now()
);

-- MURAL / ZOEIRA
create table comentarios (
  id uuid primary key default gen_random_uuid(),
  bolao_id uuid references boloes(id) on delete cascade,
  usuario_id uuid references perfis(id) on delete cascade,
  texto text not null,
  criado_em timestamptz default now()
);

-- LOG ANTIFRAUDE
create table snapshots_palpites (
  id uuid primary key default gen_random_uuid(),
  partida_id bigint references partidas(id),
  conteudo jsonb not null,
  gerado_em timestamptz default now()
);
