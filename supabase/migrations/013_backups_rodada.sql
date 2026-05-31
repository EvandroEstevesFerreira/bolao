-- Tabela de backups completos por rodada
create table backups_rodada (
  id uuid primary key default gen_random_uuid(),
  rodada text not null,
  tipo text not null default 'manual',
  partidas jsonb not null,
  palpites jsonb not null,
  ranking jsonb not null,
  total_partidas int not null default 0,
  total_palpites int not null default 0,
  total_jogadores int not null default 0,
  criado_por uuid references perfis(id),
  criado_em timestamptz default now()
);

alter table backups_rodada enable row level security;

create policy "backup_leitura_admin" on backups_rodada
  for select using (
    exists (select 1 from perfis where id = criado_por and is_admin = true)
  );

create policy "backup_insert_admin" on backups_rodada
  for insert with check (
    exists (select 1 from perfis where id = criado_por and is_admin = true)
  );
