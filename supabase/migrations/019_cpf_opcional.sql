-- Migration: Tornar CPF opcional no perfil
-- Permite cadastro sem CPF (login por e-mail ou WhatsApp)

alter table perfis alter column cpf drop not null;
