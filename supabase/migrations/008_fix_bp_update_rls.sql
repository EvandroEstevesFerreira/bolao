-- Permitir update em bolao_participantes (pagamento, valor_pago)
create policy "bp_update" on bolao_participantes for update using (true);
