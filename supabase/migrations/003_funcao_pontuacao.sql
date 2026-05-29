-- Função de cálculo de pontos (motor de pontuação)
create or replace function calcular_pontos(
  placar_real_casa int,
  placar_real_fora int,
  palpite_casa int,
  palpite_fora int
) returns int as $$
declare
  acertou_placar_casa boolean;
  acertou_placar_fora boolean;
  resultado_real int;
  resultado_palpite int;
  acertou_vencedor boolean;
begin
  if placar_real_casa is null or placar_real_fora is null
     or palpite_casa is null or palpite_fora is null then
    return 0;
  end if;

  acertou_placar_casa := (palpite_casa = placar_real_casa);
  acertou_placar_fora := (palpite_fora = placar_real_fora);
  resultado_real := sign(placar_real_casa - placar_real_fora);
  resultado_palpite := sign(palpite_casa - palpite_fora);
  acertou_vencedor := (resultado_real = resultado_palpite);

  -- Acertou vencedor e placar exato
  if acertou_vencedor and acertou_placar_casa and acertou_placar_fora then
    return 10;
  end if;

  -- Acertou vencedor e placar de um time
  if acertou_vencedor and (acertou_placar_casa or acertou_placar_fora) then
    return 7;
  end if;

  -- Acertou apenas o vencedor
  if acertou_vencedor then
    return 5;
  end if;

  -- Acertou placar de um time, mas errou o resultado
  if acertou_placar_casa or acertou_placar_fora then
    return 2;
  end if;

  return 0;
end;
$$ language plpgsql immutable;
