// Edge Function: Popular seleções e partidas da Copa 2026 via API-Football
// Executar uma única vez para fazer o seed inicial

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

Deno.serve(async (req) => {
  try {
    if (!API_FOOTBALL_KEY) {
      return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY não configurada' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Buscar times da Copa 2026
    const teamsRes = await fetch(
      'https://v3.football.api-sports.io/teams?league=1&season=2026',
      { headers: { 'x-apisports-key': API_FOOTBALL_KEY } }
    )
    const teamsData = await teamsRes.json()

    let selecoesSalvas = 0
    for (const item of teamsData.response || []) {
      const team = item.team
      await supabase.from('selecoes').upsert({
        id: team.id,
        nome: team.name,
        codigo_fifa: team.code || team.name.substring(0, 3).toUpperCase(),
        bandeira_url: team.logo,
      })
      selecoesSalvas++
    }

    // 2. Buscar todos os jogos da Copa 2026
    const fixturesRes = await fetch(
      'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
      { headers: { 'x-apisports-key': API_FOOTBALL_KEY } }
    )
    const fixturesData = await fixturesRes.json()

    let partidasSalvas = 0
    for (const item of fixturesData.response || []) {
      const fix = item.fixture
      const league = item.league
      const teams = item.teams

      let fase = 'grupos'
      const round = league.round?.toLowerCase() || ''
      if (round.includes('round of 32') || round.includes('oitavas')) fase = 'oitavas'
      else if (round.includes('quarter') || round.includes('quartas')) fase = 'quartas'
      else if (round.includes('semi')) fase = 'semi'
      else if (round.includes('3rd') || round.includes('terceiro')) fase = 'terceiro'
      else if (round.includes('final') && !round.includes('semi') && !round.includes('quarter')) fase = 'final'

      // Extrair grupo da rodada (ex: "Group A - 1")
      let grupo = null
      const grupoMatch = round.match(/group\s+([a-l])/i)
      if (grupoMatch) grupo = grupoMatch[1].toUpperCase()

      await supabase.from('partidas').upsert({
        id: fix.id,
        rodada: league.round,
        fase,
        grupo,
        data_hora: fix.date,
        selecao_casa_id: teams.home?.id,
        selecao_fora_id: teams.away?.id,
        estadio: fix.venue?.name,
        cidade: fix.venue?.city,
        status: fix.status?.short === 'FT' ? 'encerrado' :
                ['1H', '2H', 'HT', 'ET'].includes(fix.status?.short) ? 'ao_vivo' : 'agendado',
      })
      partidasSalvas++
    }

    // 3. Atualizar grupos nas seleções
    const { data: partGrupos } = await supabase
      .from('partidas')
      .select('selecao_casa_id, grupo')
      .not('grupo', 'is', null)

    if (partGrupos) {
      const grupoMap: Record<number, string> = {}
      for (const p of partGrupos) {
        if (p.selecao_casa_id && p.grupo) {
          grupoMap[p.selecao_casa_id] = p.grupo
        }
      }
      for (const [id, grupo] of Object.entries(grupoMap)) {
        await supabase.from('selecoes').update({ grupo }).eq('id', parseInt(id))
      }
    }

    return new Response(
      JSON.stringify({ ok: true, selecoesSalvas, partidasSalvas }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
