-- Permitir criar e editar bolões (auth customizada, sem auth.uid())
create policy "boloes_insert" on boloes for insert with check (true);
create policy "boloes_update" on boloes for update using (true);
