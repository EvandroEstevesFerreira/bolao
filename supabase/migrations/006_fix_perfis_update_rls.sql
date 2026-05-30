-- Corrigir RLS de update em perfis: auth customizada não usa auth.uid()
drop policy if exists "perfis_proprio_edicao" on perfis;
create policy "perfis_proprio_edicao" on perfis for update using (true);
