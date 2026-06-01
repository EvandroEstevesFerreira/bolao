import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function respond(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function verificarAdmin(adminId: string): Promise<boolean> {
  const { data } = await supabase
    .from('perfis')
    .select('is_admin')
    .eq('id', adminId)
    .eq('ativo', true)
    .single()
  return data?.is_admin === true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, admin_id, payload } = await req.json()

    if (!admin_id) return respond({ error: 'admin_id obrigatório' }, 400)

    const isAdmin = await verificarAdmin(admin_id)
    if (!isAdmin) return respond({ error: 'Acesso negado: não é admin' }, 403)

    switch (action) {
      case 'listar_usuarios': {
        const { data } = await supabase
          .from('perfis')
          .select('*')
          .order('criado_em', { ascending: false })
        return respond({ data })
      }

      case 'cadastrar_usuario': {
        const { error } = await supabase.from('perfis').insert(payload)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'cadastrar_lote': {
        let ok = 0, erros = 0
        for (const dados of payload.usuarios) {
          const { error } = await supabase.from('perfis').insert(dados)
          if (error) erros++
          else ok++
        }
        return respond({ ok, erros })
      }

      case 'toggle_ativo': {
        const { usuario_id, ativo } = payload
        const { error } = await supabase
          .from('perfis')
          .update({ ativo })
          .eq('id', usuario_id)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'toggle_admin': {
        const { usuario_id, is_admin } = payload
        const { error } = await supabase
          .from('perfis')
          .update({ is_admin })
          .eq('id', usuario_id)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'listar_convites': {
        const { data } = await supabase
          .from('convites')
          .select('*')
          .order('criado_em', { ascending: false })
        return respond({ data })
      }

      case 'gerar_convites': {
        const { error } = await supabase.from('convites').insert(payload.convites)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'atualizar_placar': {
        const { partida_id, placar_casa, placar_fora, status } = payload
        const { error } = await supabase
          .from('partidas')
          .update({
            placar_casa,
            placar_fora,
            status: status || 'encerrado',
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', partida_id)

        if (error) return respond({ error: error.message }, 400)

        if (status === 'encerrado' || !status) {
          const { data: palpites } = await supabase
            .from('palpites')
            .select('*')
            .eq('partida_id', partida_id)

          if (palpites) {
            for (const p of palpites) {
              const pontos = calcularPontos(placar_casa, placar_fora, p.placar_casa, p.placar_fora)
              await supabase.from('palpites').update({ pontos }).eq('id', p.id)
            }

            await supabase.from('snapshots_palpites').insert({
              partida_id,
              conteudo: palpites,
            })
          }
        }

        return respond({ ok: true })
      }

      case 'criar_bolao': {
        const { error } = await supabase.from('boloes').insert(payload)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'atualizar_bolao': {
        const { bolao_id, ...dados } = payload
        const { error } = await supabase.from('boloes').update(dados).eq('id', bolao_id)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'toggle_pagamento': {
        const { bolao_id, usuario_id, pago, data_pagamento } = payload
        const { error } = await supabase
          .from('bolao_participantes')
          .update({ pago, data_pagamento })
          .eq('bolao_id', bolao_id)
          .eq('usuario_id', usuario_id)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'atualizar_valor_pago': {
        const { bolao_id, usuario_id, valor_pago } = payload
        const { error } = await supabase
          .from('bolao_participantes')
          .update({ valor_pago })
          .eq('bolao_id', bolao_id)
          .eq('usuario_id', usuario_id)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'recalcular_arrecadado': {
        const { bolao_id } = payload
        const { data } = await supabase
          .from('bolao_participantes')
          .select('valor_pago')
          .eq('bolao_id', bolao_id)
          .eq('pago', true)
        const total = (data || []).reduce((acc: number, p: any) => acc + (p.valor_pago || 0), 0)
        await supabase.from('boloes').update({ valor_arrecadado: total }).eq('id', bolao_id)
        return respond({ ok: true, total })
      }

      case 'salvar_premiacao': {
        const { bolao_id, posicao, percentual } = payload
        const { data: existing } = await supabase
          .from('premiacao_regras')
          .select('posicao')
          .eq('bolao_id', bolao_id)
          .eq('posicao', posicao)
          .single()

        const { error } = existing
          ? await supabase.from('premiacao_regras').update({ percentual }).eq('bolao_id', bolao_id).eq('posicao', posicao)
          : await supabase.from('premiacao_regras').insert({ bolao_id, posicao, percentual })

        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'remover_premiacao': {
        const { bolao_id, posicao } = payload
        const { error } = await supabase
          .from('premiacao_regras')
          .delete()
          .eq('bolao_id', bolao_id)
          .eq('posicao', posicao)
        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true })
      }

      case 'criar_backup': {
        const { rodada, criado_por } = payload

        const { data: partidas } = await supabase.from('partidas').select('*').eq('rodada', rodada)
        const partidaIds = (partidas || []).map((p: any) => p.id)
        const { data: palpites } = await supabase.from('palpites').select('*').in('partida_id', partidaIds)
        const { data: perfis } = await supabase.from('perfis').select('id, nickname').eq('ativo', true)
        const { data: todosPalpites } = await supabase.from('palpites').select('usuario_id, pontos')

        const rankMap: Record<string, { pontos: number; cravadas: number }> = {}
        todosPalpites?.forEach((p: any) => {
          if (!rankMap[p.usuario_id]) rankMap[p.usuario_id] = { pontos: 0, cravadas: 0 }
          rankMap[p.usuario_id].pontos += p.pontos || 0
          if (p.pontos === 10) rankMap[p.usuario_id].cravadas++
        })

        const ranking = (perfis || []).map((p: any) => ({
          id: p.id, nickname: p.nickname,
          ...(rankMap[p.id] || { pontos: 0, cravadas: 0 }),
        })).sort((a: any, b: any) => b.pontos - a.pontos || b.cravadas - a.cravadas)

        const { error } = await supabase.from('backups_rodada').insert({
          rodada,
          tipo: 'manual',
          partidas: partidas || [],
          palpites: palpites || [],
          ranking,
          total_partidas: partidas?.length || 0,
          total_palpites: palpites?.length || 0,
          total_jogadores: perfis?.length || 0,
          criado_por,
        })

        if (error) return respond({ error: error.message }, 400)
        return respond({ ok: true, total_partidas: partidas?.length || 0, total_palpites: palpites?.length || 0 })
      }

      case 'listar_backups': {
        const { data } = await supabase
          .from('backups_rodada')
          .select('*')
          .order('criado_em', { ascending: false })
        return respond({ data })
      }

      case 'listar_sync_logs': {
        const { data } = await supabase
          .from('sync_log')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(30)
        return respond({ data })
      }

      case 'dashboard_stats': {
        const [perfisRes, palpitesRes, partidasRes, bpRes] = await Promise.all([
          supabase.from('perfis').select('id, ativo'),
          supabase.from('palpites').select('usuario_id, partida_id'),
          supabase.from('partidas').select('id, status'),
          supabase.from('bolao_participantes').select('pago'),
        ])
        return respond({
          perfis: perfisRes.data || [],
          palpites: palpitesRes.data || [],
          partidas: partidasRes.data || [],
          bp: bpRes.data || [],
        })
      }

      case 'listar_participantes': {
        const { bolao_id } = payload
        const { data } = await supabase
          .from('bolao_participantes')
          .select('*, perfis(nome, nickname)')
          .eq('bolao_id', bolao_id)
        return respond({ data })
      }

      default:
        return respond({ error: `Ação desconhecida: ${action}` }, 400)
    }
  } catch (err) {
    return respond({ error: String(err) }, 500)
  }
})

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
