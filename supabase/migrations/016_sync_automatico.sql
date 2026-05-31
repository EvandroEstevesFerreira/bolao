-- Tabela de controle de sincronizações automáticas
create table sync_log (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'auto',
  rodadas_consultadas int[] not null default '{}',
  requisicoes_api int not null default 0,
  eventos_processados int not null default 0,
  atualizados int not null default 0,
  pontos_recalculados int not null default 0,
  backups_gerados int not null default 0,
  erro text,
  criado_em timestamptz default now()
);

alter table sync_log enable row level security;
create policy "sync_log_leitura" on sync_log for select using (true);

-- Função auxiliar: contar requisições API do dia
CREATE OR REPLACE FUNCTION fn_requisicoes_hoje()
RETURNS int AS $$
  SELECT COALESCE(SUM(requisicoes_api), 0)::int
  FROM sync_log
  WHERE criado_em >= CURRENT_DATE
    AND erro IS NULL;
$$ LANGUAGE sql STABLE;

-- Função auxiliar: verificar se estamos na janela de jogos do dia
-- Retorna: 'ao_vivo' se tem jogo acontecendo, 'janela' se estamos na janela,
-- 'fora' se não tem jogos hoje ou estamos fora da janela
CREATE OR REPLACE FUNCTION fn_janela_jogos()
RETURNS text AS $$
DECLARE
  v_tem_ao_vivo int;
  v_primeiro timestamptz;
  v_ultimo timestamptz;
  v_agora timestamptz := now();
BEGIN
  -- Tem jogo ao vivo?
  SELECT count(*) INTO v_tem_ao_vivo
  FROM partidas WHERE status = 'ao_vivo';
  IF v_tem_ao_vivo > 0 THEN RETURN 'ao_vivo'; END IF;

  -- Janela do dia: 30min antes do primeiro jogo até 3h após o último
  SELECT MIN(data_hora), MAX(data_hora) INTO v_primeiro, v_ultimo
  FROM partidas
  WHERE data_hora::date = CURRENT_DATE
    AND status != 'encerrado';

  IF v_primeiro IS NULL THEN RETURN 'fora'; END IF;

  IF v_agora >= (v_primeiro - interval '30 minutes')
     AND v_agora <= (v_ultimo + interval '3 hours')
  THEN RETURN 'janela'; END IF;

  RETURN 'fora';
END;
$$ LANGUAGE plpgsql STABLE;

-- Função auxiliar: quais rodadas têm jogos hoje (não encerrados)
CREATE OR REPLACE FUNCTION fn_rodadas_ativas_hoje()
RETURNS text[] AS $$
  SELECT COALESCE(array_agg(DISTINCT rodada), '{}')
  FROM partidas
  WHERE data_hora::date = CURRENT_DATE
    AND status != 'encerrado';
$$ LANGUAGE sql STABLE;
