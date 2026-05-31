-- Adicionar policies de escrita para premiacao_regras
-- (a validação de admin é feita no frontend; RLS permite operações via anon key)
create policy "premiacao_insert" on premiacao_regras for insert with check (true);
create policy "premiacao_update" on premiacao_regras for update using (true);
create policy "premiacao_delete" on premiacao_regras for delete using (true);
