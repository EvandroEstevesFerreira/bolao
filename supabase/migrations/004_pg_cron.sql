-- Habilitar pg_cron (extensão do Supabase)
-- Executar no SQL Editor do Supabase com permissão de superuser

-- create extension if not exists pg_cron;

-- Agendar sincronização diária (fora de dia de jogo)
-- select cron.schedule(
--   'sync-resultados-diario',
--   '0 8 * * *',  -- todo dia às 8h UTC (5h BRT)
--   $$
--   select net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/sincronizar-resultados',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- Em dia de jogo: a cada 5 minutos durante a janela (ativar manualmente)
-- select cron.schedule(
--   'sync-resultados-jogo',
--   '*/5 15-23 * 6-7 *',  -- a cada 5 min, 15h-23h UTC, jun-jul
--   $$
--   select net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/sincronizar-resultados',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- NOTA: Descomente as linhas acima no SQL Editor do Supabase.
-- O pg_cron precisa ser ativado nas extensões do projeto.
-- A chave service_role deve estar configurada em app.settings.
