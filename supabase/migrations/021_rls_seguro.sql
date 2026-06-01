-- ============================================================
-- REFORÇO DE RLS — POLÍTICAS RESTRITIVAS POR USUÁRIO
-- ============================================================

-- 1. Função helper: retorna o perfil.id do usuário autenticado
CREATE OR REPLACE FUNCTION meu_perfil_id() RETURNS uuid AS $$
  SELECT id FROM perfis WHERE auth_uid = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Atualizar view pública com campos seguros (setor_cr para ranking)
DROP VIEW IF EXISTS perfis_publicos;
CREATE VIEW perfis_publicos AS
SELECT id, nickname, avatar_url, setor_cr, ativo, criado_em
FROM perfis;

GRANT SELECT ON perfis_publicos TO anon, authenticated;

-- ============================================================
-- DROPAR TODAS AS POLICIES PERMISSIVAS
-- ============================================================

DROP POLICY IF EXISTS "perfis_proprio_leitura" ON perfis;
DROP POLICY IF EXISTS "perfis_proprio_edicao" ON perfis;
DROP POLICY IF EXISTS "perfis_insert" ON perfis;

DROP POLICY IF EXISTS "palpites_proprio" ON palpites;
DROP POLICY IF EXISTS "palpites_insert" ON palpites;
DROP POLICY IF EXISTS "palpites_update" ON palpites;

DROP POLICY IF EXISTS "comentarios_leitura" ON comentarios;
DROP POLICY IF EXISTS "comentarios_insert" ON comentarios;

DROP POLICY IF EXISTS "convites_leitura" ON convites;
DROP POLICY IF EXISTS "convites_insert" ON convites;
DROP POLICY IF EXISTS "convites_update" ON convites;

DROP POLICY IF EXISTS "boloes_leitura" ON boloes;
DROP POLICY IF EXISTS "boloes_insert" ON boloes;
DROP POLICY IF EXISTS "boloes_update" ON boloes;

DROP POLICY IF EXISTS "bp_leitura" ON bolao_participantes;
DROP POLICY IF EXISTS "bp_insert" ON bolao_participantes;
DROP POLICY IF EXISTS "bp_update" ON bolao_participantes;

DROP POLICY IF EXISTS "premiacao_leitura" ON premiacao_regras;
DROP POLICY IF EXISTS "premiacao_insert" ON premiacao_regras;
DROP POLICY IF EXISTS "premiacao_update" ON premiacao_regras;
DROP POLICY IF EXISTS "premiacao_delete" ON premiacao_regras;

DROP POLICY IF EXISTS "bonus_leitura" ON palpites_bonus;
DROP POLICY IF EXISTS "bonus_insert" ON palpites_bonus;
DROP POLICY IF EXISTS "bonus_update" ON palpites_bonus;

DROP POLICY IF EXISTS "backup_leitura_admin" ON backups_rodada;
DROP POLICY IF EXISTS "backup_insert_admin" ON backups_rodada;

DROP POLICY IF EXISTS "snapshots_leitura" ON snapshots_palpites;

-- ============================================================
-- NOVAS POLÍTICAS RESTRITIVAS
-- ============================================================

-- PERFIS: só lê o próprio perfil completo
-- (para outros usuários, usar a view perfis_publicos)
CREATE POLICY "perfis_select_proprio" ON perfis FOR SELECT
  USING (id = meu_perfil_id());

CREATE POLICY "perfis_update_proprio" ON perfis FOR UPDATE
  USING (id = meu_perfil_id())
  WITH CHECK (id = meu_perfil_id());

-- perfis INSERT: só via service_role (Edge Functions login-cpf e registro)

-- PALPITES: leitura pública (ranking), escrita só do próprio usuário
CREATE POLICY "palpites_select_todos" ON palpites FOR SELECT
  USING (true);

CREATE POLICY "palpites_insert_proprio" ON palpites FOR INSERT
  WITH CHECK (usuario_id = meu_perfil_id());

CREATE POLICY "palpites_update_proprio" ON palpites FOR UPDATE
  USING (usuario_id = meu_perfil_id())
  WITH CHECK (usuario_id = meu_perfil_id());

-- COMENTARIOS: leitura pública, escrita só do próprio usuário
CREATE POLICY "comentarios_select_todos" ON comentarios FOR SELECT
  USING (true);

CREATE POLICY "comentarios_insert_proprio" ON comentarios FOR INSERT
  WITH CHECK (usuario_id = meu_perfil_id());

-- CONVITES: leitura pública (validação de token), escrita via service_role
CREATE POLICY "convites_select_todos" ON convites FOR SELECT
  USING (true);

-- BOLOES: leitura pública, escrita via service_role (admin)
CREATE POLICY "boloes_select_todos" ON boloes FOR SELECT
  USING (true);

-- BOLAO_PARTICIPANTES: leitura pública, escrita só do próprio usuário
CREATE POLICY "bp_select_todos" ON bolao_participantes FOR SELECT
  USING (true);

CREATE POLICY "bp_insert_proprio" ON bolao_participantes FOR INSERT
  WITH CHECK (usuario_id = meu_perfil_id());

CREATE POLICY "bp_update_proprio" ON bolao_participantes FOR UPDATE
  USING (usuario_id = meu_perfil_id())
  WITH CHECK (usuario_id = meu_perfil_id());

-- PREMIACAO_REGRAS: leitura pública, escrita via service_role
CREATE POLICY "premiacao_select_todos" ON premiacao_regras FOR SELECT
  USING (true);

-- PALPITES_BONUS: leitura pública, escrita só do próprio
CREATE POLICY "bonus_select_todos" ON palpites_bonus FOR SELECT
  USING (true);

CREATE POLICY "bonus_insert_proprio" ON palpites_bonus FOR INSERT
  WITH CHECK (usuario_id = meu_perfil_id());

CREATE POLICY "bonus_update_proprio" ON palpites_bonus FOR UPDATE
  USING (usuario_id = meu_perfil_id())
  WITH CHECK (usuario_id = meu_perfil_id());

-- SNAPSHOTS: leitura pública, escrita via service_role
CREATE POLICY "snapshots_select_todos" ON snapshots_palpites FOR SELECT
  USING (true);

-- BACKUPS_RODADA: sem acesso via anon/authenticated (apenas service_role)
-- (não criamos nenhuma policy = acesso bloqueado)

-- CONQUISTAS: manter leitura pública (já existia conquistas_leitura)
-- (política conquistas_leitura permanece inalterada)

-- PARTIDAS: manter leitura pública (já existia partidas_leitura)
-- SELECOES: manter leitura pública (já existia selecoes_leitura)
-- Escrita de partidas via service_role apenas (sync Edge Functions)
