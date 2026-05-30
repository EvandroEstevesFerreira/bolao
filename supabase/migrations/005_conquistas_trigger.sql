-- Função para verificar e conceder conquistas após recálculo de pontos
create or replace function verificar_conquistas()
returns trigger as $$
declare
  v_total_cravadas int;
  v_vitorias_seguidas int;
  v_ultimo_pontos int;
begin
  -- Conquista: Cravada (10 pontos)
  if NEW.pontos = 10 then
    insert into conquistas (usuario_id, tipo, partida_id)
    values (NEW.usuario_id, 'cravada', NEW.partida_id)
    on conflict do nothing;

    -- Conquista: Vidente (3 cravadas)
    select count(*) into v_total_cravadas
    from palpites where usuario_id = NEW.usuario_id and pontos = 10;

    if v_total_cravadas >= 3 then
      insert into conquistas (usuario_id, tipo, partida_id)
      select NEW.usuario_id, 'vidente', NEW.partida_id
      where not exists (
        select 1 from conquistas
        where usuario_id = NEW.usuario_id and tipo = 'vidente'
      );
    end if;
  end if;

  -- Conquista: Pé Quente (5 acertos de vencedor seguidos, pontos >= 5)
  select count(*) into v_vitorias_seguidas
  from (
    select pontos,
      row_number() over (order by criado_em desc) as rn
    from palpites
    where usuario_id = NEW.usuario_id and pontos is not null
    order by criado_em desc
    limit 10
  ) sub
  where pontos >= 5
  and rn <= 5;

  if v_vitorias_seguidas >= 5 then
    insert into conquistas (usuario_id, tipo, partida_id)
    select NEW.usuario_id, 'pe_quente', NEW.partida_id
    where not exists (
      select 1 from conquistas
      where usuario_id = NEW.usuario_id and tipo = 'pe_quente'
    );
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Trigger: verificar conquistas quando pontos são atualizados
drop trigger if exists trigger_verificar_conquistas on palpites;
create trigger trigger_verificar_conquistas
  after update of pontos on palpites
  for each row
  when (NEW.pontos is not null and NEW.pontos > 0)
  execute function verificar_conquistas();
