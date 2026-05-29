// Edge Function: Sincronizar resultados da API-Football
// Chamada via pg_cron ou manualmente pelo admin
// Consulta a API-Football, atualiza partidas e recalcula pontos

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface Fixture {
  fixture: { id: number; status: { short: string } }
  goals: { home: number | null; away: number | null }
  score: {
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

function mapStatus(apiStatus: string): string {
  const aoVivo = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE']
  const encerrado = ['FT', 'AET', 'PEN']
  if (aoVivo.includes(apiStatus)) return 'ao_vivo'
  if (encerrado.includes(apiStatus)) return 'encerrado'
  return 'agendado'
}

function calcularPontos(
  realCasa: number, realFora: number,
  palpiteCasa: number, palpiteFora: number
): number {
  const acCasa = palpiteCasa === realCasa
  const acFora = palpiteFora === realFora
  const resReal = Math.sign(realCasa - realFora)
  const resPalpite = Math.sign(palpiteCasa - palpiteFora)
  const acVencedor = resReal === resPalpite

  if (acVencedor && acCasa && acFora) return 10
  if (acVencedor && (acCasa || acFora)) return 7
  if (acVencedor) return 5
  if (acCasa || acFora) return 2
  return 0
}

Deno.serve(async (req) => {
  try {
    if (!API_FOOTBALL_KEY) {
      return new Response(JSON.stringify({ error: 'API_FOOTBALL_KEY não configurada' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Buscar jogos do dia na API-Football
    const today = new Date().toISOString().split('T')[0]
    const apiUrl = `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}`

    const apiRes = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': API_FOOTBALL_KEY,
      },
    })

    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: 'Erro na API-Football' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiData = await apiRes.json()
    const fixtures: Fixture[] = apiData.response || []

    let atualizados = 0
    let pontosRecalculados = 0

    for (const fix of fixtures) {
      const fixtureId = fix.fixture.id
      const status = mapStatus(fix.fixture.status.short)

      // Placar do tempo regulamentar + prorrogação (sem pênaltis)
      let placarCasa = fix.score.fulltime.home
      let placarFora = fix.score.fulltime.away
      let placarCasaProrrogacao = fix.score.extratime.home
      let placarForaProrrogacao = fix.score.extratime.away
      const decidido_penaltis = fix.score.penalty.home !== null

      // Para pontuação: usar fulltime (inclui prorrogação na API-Football)
      // Se decidido nos pênaltis, o placar antes dos pênaltis é o que vale
      if (placarCasa === null) {
        placarCasa = fix.goals.home
        placarFora = fix.goals.away
      }

      const { data: partidaExistente } = await supabase
        .from('partidas')
        .select('id, status')
        .eq('id', fixtureId)
        .single()

      if (!partidaExistente) continue

      const { error: updateError } = await supabase
        .from('partidas')
        .update({
          placar_casa: placarCasa,
          placar_fora: placarFora,
          placar_casa_prorrogacao: placarCasaProrrogacao,
          placar_fora_prorrogacao: placarForaProrrogacao,
          decidido_penaltis,
          status,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', fixtureId)

      if (!updateError) atualizados++

      // Se jogo encerrou, recalcular pontos
      if (status === 'encerrado' && partidaExistente.status !== 'encerrado' && placarCasa !== null && placarFora !== null) {
        const { data: palpites } = await supabase
          .from('palpites')
          .select('*')
          .eq('partida_id', fixtureId)

        if (palpites) {
          for (const p of palpites) {
            const pontos = calcularPontos(placarCasa, placarFora, p.placar_casa, p.placar_fora)
            await supabase.from('palpites').update({ pontos }).eq('id', p.id)
            pontosRecalculados++
          }

          // Snapshot antifraude
          await supabase.from('snapshots_palpites').insert({
            partida_id: fixtureId,
            conteudo: palpites,
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        fixtures: fixtures.length,
        atualizados,
        pontosRecalculados,
        data: today,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
