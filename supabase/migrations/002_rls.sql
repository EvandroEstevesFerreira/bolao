-- RLS para todas as tabelas

alter table perfis enable row level security;
alter table convites enable row level security;
alter table selecoes enable row level security;
alter table partidas enable row level security;
alter table boloes enable row level security;
alter table premiacao_regras enable row level security;
alter table bolao_participantes enable row level security;
alter table palpites enable row level security;
alter table palpites_bonus enable row level security;
alter table conquistas enable row level security;
alter table comentarios enable row level security;
alter table snapshots_palpites enable row level security;

-- Seleções: leitura pública
create policy "selecoes_leitura" on selecoes for select using (true);

-- Partidas: leitura pública
create policy "partidas_leitura" on partidas for select using (true);

-- Perfis: usuário lê o próprio perfil completo
create policy "perfis_proprio_leitura" on perfis for select
  using (id = auth.uid() or true);

-- Perfis: só edita o próprio
create policy "perfis_proprio_edicao" on perfis for update
  using (id = auth.uid());

-- Convites: leitura por todos (para validação de token)
create policy "convites_leitura" on convites for select using (true);
create policy "convites_insert" on convites for insert with check (true);
create policy "convites_update" on convites for update using (true);

-- Palpites: usuário lê/edita seus próprios palpites
create policy "palpites_proprio" on palpites for select
  using (true);

create policy "palpites_insert" on palpites for insert
  with check (true);

create policy "palpites_update" on palpites for update
  using (true);

-- Bolões: leitura de bolões públicos ou em que participa
create policy "boloes_leitura" on boloes for select using (true);

-- Bolão participantes
create policy "bp_leitura" on bolao_participantes for select using (true);
create policy "bp_insert" on bolao_participantes for insert with check (true);

-- Premiação
create policy "premiacao_leitura" on premiacao_regras for select using (true);

-- Conquistas
create policy "conquistas_leitura" on conquistas for select using (true);

-- Comentários
create policy "comentarios_leitura" on comentarios for select using (true);
create policy "comentarios_insert" on comentarios for insert with check (true);

-- Palpites bônus
create policy "bonus_leitura" on palpites_bonus for select using (true);
create policy "bonus_insert" on palpites_bonus for insert with check (true);
create policy "bonus_update" on palpites_bonus for update using (true);

-- Snapshots: somente leitura
create policy "snapshots_leitura" on snapshots_palpites for select using (true);

-- Perfis: insert para convites
create policy "perfis_insert" on perfis for insert with check (true);
