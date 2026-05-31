-- Migration: Preparar perfis para Supabase Auth
-- Adicionar campos para vincular perfis ao Supabase Auth

-- Campo para vincular ao auth.users
alter table perfis add column if not exists auth_uid uuid unique;

-- Campos de contato para novos métodos de login
alter table perfis add column if not exists email text unique;
alter table perfis add column if not exists telefone text unique;

-- Índices para busca rápida
create index if not exists idx_perfis_auth_uid on perfis(auth_uid);
create index if not exists idx_perfis_email on perfis(email);
create index if not exists idx_perfis_telefone on perfis(telefone);

-- Tabela para OTP do WhatsApp (Evolution API)
create table if not exists whatsapp_otp (
  id uuid primary key default gen_random_uuid(),
  telefone text not null,
  codigo text not null,
  tentativas int default 0,
  verificado boolean default false,
  expira_em timestamptz not null default (now() + interval '5 minutes'),
  criado_em timestamptz default now()
);

-- Limpar OTPs expirados automaticamente
create index if not exists idx_otp_telefone on whatsapp_otp(telefone);
create index if not exists idx_otp_expira on whatsapp_otp(expira_em);

-- RLS para whatsapp_otp (só service_role acessa)
alter table whatsapp_otp enable row level security;

-- Função para limpar OTPs expirados (chamar via cron)
create or replace function fn_limpar_otp_expirados()
returns void language plpgsql security definer as $$
begin
  delete from whatsapp_otp where expira_em < now();
end;
$$;
