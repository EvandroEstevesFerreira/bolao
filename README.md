# Bolão Sistenge — Copa do Mundo 2026

App de bolão interno da **Sistenge Construções e Comércio Ltda.** para a Copa do Mundo FIFA 2026.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Deploy:** Vercel (frontend) + Supabase (backend)
- **PWA:** Instalável como app na tela inicial

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as credenciais do Supabase

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Banco de Dados

As migrations ficam em `supabase/migrations/` e os seeds em `supabase/seed/`.

Execute-os no painel SQL do Supabase na ordem:
1. `001_schema.sql` — Criação das tabelas
2. `002_rls.sql` — Row Level Security
3. `003_funcao_pontuacao.sql` — Função de cálculo de pontos
4. `001_selecoes.sql` — Seed das 48 seleções
5. `002_partidas_grupos.sql` — Seed dos jogos da fase de grupos

## Funcionalidades (Fase 1 — MVP)

- Cadastro por CPF + link de convite + nickname
- Tela de palpites com trava 10 min antes do jogo
- Motor de pontuação (10/7/5/2/0)
- Ranking geral com desempate completo
- Painel administrativo (cadastro, convites, override de placar)
- Regulamento completo
- Realtime via Supabase

## Aviso

Este sistema é ferramenta de acompanhamento e cálculo. A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
