-- ============================================================
-- REFORÇO DE SEGURANÇA — CONSTRAINTS E TRIGGERS NO BANCO
-- ============================================================

-- 1. TRAVA DE PALPITE: impedir alteração de palpite < 10 min antes do jogo
-- (Hoje só o frontend impede — qualquer chamada direta à API burlaria isso)
CREATE OR REPLACE FUNCTION fn_verificar_trava_palpite()
RETURNS TRIGGER AS $$
DECLARE
  v_data_hora timestamptz;
  v_status text;
BEGIN
  SELECT data_hora, status INTO v_data_hora, v_status
  FROM partidas WHERE id = NEW.partida_id;

  IF v_status IN ('encerrado', 'ao_vivo') THEN
    RAISE EXCEPTION 'Palpite não permitido: jogo já em andamento ou encerrado.';
  END IF;

  IF v_data_hora IS NOT NULL AND v_data_hora - INTERVAL '10 minutes' <= NOW() THEN
    RAISE EXCEPTION 'Palpite travado: menos de 10 minutos para o início do jogo.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trava_palpite_insert ON palpites;
CREATE TRIGGER trg_trava_palpite_insert
  BEFORE INSERT ON palpites
  FOR EACH ROW EXECUTE FUNCTION fn_verificar_trava_palpite();

DROP TRIGGER IF EXISTS trg_trava_palpite_update ON palpites;
CREATE TRIGGER trg_trava_palpite_update
  BEFORE UPDATE ON palpites
  FOR EACH ROW
  WHEN (OLD.placar_casa IS DISTINCT FROM NEW.placar_casa
     OR OLD.placar_fora IS DISTINCT FROM NEW.placar_fora)
  EXECUTE FUNCTION fn_verificar_trava_palpite();


-- 2. PROTEGER CAMPO PONTOS: só service_role pode alterar pontos
-- (Impede que o cliente anon escreva pontuação arbitrária)
CREATE OR REPLACE FUNCTION fn_proteger_pontos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.pontos IS DISTINCT FROM NEW.pontos THEN
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
      NEW.pontos := OLD.pontos;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proteger_pontos ON palpites;
CREATE TRIGGER trg_proteger_pontos
  BEFORE UPDATE ON palpites
  FOR EACH ROW EXECUTE FUNCTION fn_proteger_pontos();


-- 3. CHECK CONSTRAINTS: validar dados no nível do banco
ALTER TABLE palpites
  ADD CONSTRAINT chk_placar_casa CHECK (placar_casa >= 0 AND placar_casa <= 99),
  ADD CONSTRAINT chk_placar_fora CHECK (placar_fora >= 0 AND placar_fora <= 99);

ALTER TABLE premiacao_regras
  ADD CONSTRAINT chk_percentual CHECK (percentual > 0 AND percentual <= 100),
  ADD CONSTRAINT chk_posicao CHECK (posicao >= 1 AND posicao <= 20);

ALTER TABLE partidas
  ADD CONSTRAINT chk_placar_partida_casa CHECK (placar_casa IS NULL OR (placar_casa >= 0 AND placar_casa <= 99)),
  ADD CONSTRAINT chk_placar_partida_fora CHECK (placar_fora IS NULL OR (placar_fora >= 0 AND placar_fora <= 99));


-- 4. PROTEGER CAMPO IS_ADMIN: só service_role pode promover admin
CREATE OR REPLACE FUNCTION fn_proteger_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.is_admin = true THEN
    IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
      NEW.is_admin := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proteger_admin ON perfis;
CREATE TRIGGER trg_proteger_admin
  BEFORE INSERT OR UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION fn_proteger_admin();


-- 5. PROTEGER PIN_HASH: nunca retornar pin_hash em queries normais
-- (Criamos uma view segura para leitura pública)
CREATE OR REPLACE VIEW perfis_publicos AS
SELECT id, nickname, avatar_url, ativo, criado_em
FROM perfis
WHERE ativo = true;


-- 6. IMPEDIR DUPLICATA: um usuário só pode ter um palpite por partida
-- (Constraint UNIQUE garante isso no banco, não só no código)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_palpite_usuario_partida'
  ) THEN
    ALTER TABLE palpites ADD CONSTRAINT uq_palpite_usuario_partida UNIQUE (usuario_id, partida_id);
  END IF;
END $$;


-- 7. RATE LIMIT em comentários: máximo 1 por segundo por usuário
CREATE OR REPLACE FUNCTION fn_rate_limit_comentario()
RETURNS TRIGGER AS $$
DECLARE
  v_ultimo timestamptz;
BEGIN
  SELECT MAX(criado_em) INTO v_ultimo
  FROM comentarios
  WHERE usuario_id = NEW.usuario_id;

  IF v_ultimo IS NOT NULL AND v_ultimo > NOW() - INTERVAL '1 second' THEN
    RAISE EXCEPTION 'Aguarde antes de enviar outra mensagem.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rate_limit_comentario ON comentarios;
CREATE TRIGGER trg_rate_limit_comentario
  BEFORE INSERT ON comentarios
  FOR EACH ROW EXECUTE FUNCTION fn_rate_limit_comentario();
