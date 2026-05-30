-- Adicionar coluna para mapear com a API externa (SportAPI7)
ALTER TABLE partidas ADD COLUMN IF NOT EXISTS api_event_id bigint UNIQUE;
