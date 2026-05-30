import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const TOURNAMENT_ID = 16
const SEASON_ID = 58210

function mapStatus(apiType: string): string {
  if (apiType === 'inprogress') return 'ao_vivo'
  if (apiType === 'finished') return 'encerrado'
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

async function fetchRound(round: number) {
  const url = `https://sportapi7.p.rapidapi.com/api/v1/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/round/${round}`
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY!,
      'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
    },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.events || []
}

async function mapearPartida(event: any): Promise<number | null> {
  const { data: partida } = await supabase
    .from('partidas')
    .select('id')
    .eq('api_event_id', event.id)
    .single()

  if (partida) return partida.id

  const homeId = event.homeTeam?.id
  const awayId = event.awayTeam?.id
  if (!homeId || !awayId) return null

  const { data: selCasa } = await supabase
    .from('selecoes')
    .select('id')
    .eq('nome', event.homeTeam.name)
    .single()

  const { data: selFora } = await supabase
    .from('selecoes')
    .select('id')
    .eq('nome', event.awayTeam.name)
    .single()

  if (!selCasa || !selFora) return null

  const { data: match } = await supabase
    .from('partidas')
    .select('id')
    .eq('selecao_casa_id', selCasa.id)
    .eq('selecao_fora_id', selFora.id)
    .is('api_event_id', null)
    .single()

  if (match) {
    await supabase
      .from('partidas')
      .update({ api_event_id: event.id })
      .eq('id', match.id)
    return match.id
  }

  return null
}

Deno.serve(async (req) => {
  try {
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'RAPIDAPI_KEY não configurada' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const roundParam = url.searchParams.get('round')
    const rounds = roundParam ? [parseInt(roundParam)] : [1, 2, 3]

    let atualizados = 0
    let pontosRecalculados = 0
    let totalEventos = 0

    for (const round of rounds) {
      const events = await fetchRound(round)
      totalEventos += events.length

      for (const event of events) {
        const status = mapStatus(event.status?.type || 'notstarted')
        const homeScore = event.homeScore?.current ?? null
        const awayScore = event.awayScore?.current ?? null

        if (status === 'agendado' && homeScore === null) continue

        const partidaId = await mapearPartida(event)
        if (!partidaId) continue

        const homeNormaltime = event.homeScore?.normaltime ?? homeScore
        const awayNormaltime = event.awayScore?.normaltime ?? awayScore
        const hasExtratime = event.homeScore?.overtime !== undefined && event.homeScore?.overtime !== null
        const hasPenalties = event.homeScore?.penalties !== undefined && event.homeScore?.penalties !== null

        const updateData: any = {
          placar_casa: homeNormaltime,
          placar_fora: awayNormaltime,
          status,
          atualizado_em: new Date().toISOString(),
        }

        if (hasExtratime) {
          updateData.placar_casa_prorrogacao = event.homeScore.overtime
          updateData.placar_fora_prorrogacao = event.awayScore.overtime
        }

        if (hasPenalties) {
          updateData.decidido_penaltis = true
        }

        const { data: partidaAtual } = await supabase
          .from('partidas')
          .select('status')
          .eq('id', partidaId)
          .single()

        const { error: updateError } = await supabase
          .from('partidas')
          .update(updateData)
          .eq('id', partidaId)

        if (!updateError) atualizados++

        if (status === 'encerrado' && partidaAtual?.status !== 'encerrado' && homeNormaltime !== null && awayNormaltime !== null) {
          const { data: palpites } = await supabase
            .from('palpites')
            .select('*')
            .eq('partida_id', partidaId)

          if (palpites) {
            for (const p of palpites) {
              const pontos = calcularPontos(homeNormaltime, awayNormaltime, p.placar_casa, p.placar_fora)
              await supabase.from('palpites').update({ pontos }).eq('id', p.id)
              pontosRecalculados++
            }

            await supabase.from('snapshots_palpites').insert({
              partida_id: partidaId,
              conteudo: palpites,
            })
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        totalEventos,
        atualizados,
        pontosRecalculados,
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
