-- ============================================================
-- CRON: Sincronização automática a cada 5 minutos
-- ============================================================
-- IMPORTANTE: Executar este script manualmente no SQL Editor do Supabase
-- após ativar as extensões pg_cron e pg_net no Dashboard.
--
-- Dashboard > Database > Extensions > Procurar "pg_cron" e "pg_net" > Enable
-- ============================================================

-- Descomente e execute no SQL Editor:

-- 1. Cron a cada 5 minutos (a Edge Function decide se deve ou não sincronizar)
-- select cron.schedule(
--   'auto-sync-copa',
--   '*/5 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://niluwlhsqktmyharnguc.supabase.co/functions/v1/auto-sync',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- 2. Para verificar crons ativos:
-- select * from cron.job;

-- 3. Para ver histórico de execuções:
-- select * from cron.job_run_details order by start_time desc limit 20;

-- 4. Para desativar:
-- select cron.unschedule('auto-sync-copa');

-- ============================================================
-- LÓGICA DE DECISÃO (dentro da Edge Function auto-sync):
--
-- A cada 5 min o cron chama a Edge Function, que decide:
--   1. Verificar orçamento: usou < 80 req hoje? Se não → skip
--   2. Verificar janela: tem jogo hoje e estamos no horário? Se não → skip
--   3. Buscar apenas rodadas com jogos hoje (1 req por rodada)
--   4. Registrar no sync_log quantas requisições usou
--
-- Cenário típico de dia de jogo (3 jogos, mesma rodada):
--   - Janela: 30min antes do 1º jogo até 3h após o último
--   - Frequência: 1 chamada a cada 5min = 12/hora
--   - Janela de ~6h = ~72 requisições (dentro do limite de 80)
--   - Cada chamada usa 1 requisição da API (1 rodada)
--
-- Fora da janela: 0 requisições consumidas
-- ============================================================
