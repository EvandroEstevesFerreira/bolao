import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Star, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react'
import Layout from '../components/Layout'

export default function Destaques() {
  const [destaques, setDestaques] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDestaques()
  }, [])

  async function carregarDestaques() {
    setCarregando(true)

    const [palpitesRes, perfisRes, partidasRes] = await Promise.all([
      supabase.from('palpites').select('usuario_id, partida_id, pontos, placar_casa, placar_fora'),
      supabase.from('perfis').select('id, nickname, avatar_url').eq('ativo', true),
      supabase.from('partidas').select('id, rodada, status').eq('status', 'encerrado'),
    ])

    const palpites = palpitesRes.data || []
    const perfis = {}
    perfisRes.data?.forEach(p => { perfis[p.id] = p })
    const partidasEncerradas = new Set((partidasRes.data || []).map(p => p.id))

    const porUsuario = {}
    palpites.forEach(p => {
      if (!partidasEncerradas.has(p.partida_id)) return
      if (!porUsuario[p.usuario_id]) {
        porUsuario[p.usuario_id] = { total: 0, cravadas: 0, jogos: 0 }
      }
      porUsuario[p.usuario_id].total += p.pontos || 0
      porUsuario[p.usuario_id].jogos++
      if (p.pontos === 10) porUsuario[p.usuario_id].cravadas++
    })

    const rodadas = {}
    palpites.forEach(p => {
      const partida = partidasRes.data?.find(pt => pt.id === p.partida_id)
      if (!partida || partida.status !== 'encerrado') return
      const rod = partida.rodada || 'Sem rodada'
      if (!rodadas[rod]) rodadas[rod] = {}
      if (!rodadas[rod][p.usuario_id]) rodadas[rod][p.usuario_id] = 0
      rodadas[rod][p.usuario_id] += p.pontos || 0
    })

    let maiorPontuadorRodada = null
    let maiorPontuacaoRodada = 0
    let rodadaDestaque = ''
    Object.entries(rodadas).forEach(([rod, usuarios]) => {
      Object.entries(usuarios).forEach(([uid, pts]) => {
        if (pts > maiorPontuacaoRodada) {
          maiorPontuacaoRodada = pts
          maiorPontuadorRodada = uid
          rodadaDestaque = rod
        }
      })
    })

    const totalCravadas = palpites.filter(p => p.pontos === 10 && partidasEncerradas.has(p.partida_id))
    const cravasMap = {}
    totalCravadas.forEach(c => {
      cravasMap[c.usuario_id] = (cravasMap[c.usuario_id] || 0) + 1
    })
    const maisClavadasId = Object.entries(cravasMap).sort((a, b) => b[1] - a[1])[0]

    const sorted = Object.entries(porUsuario).sort((a, b) => b[1].total - a[1].total)
    const lider = sorted[0]
    const lanterna = sorted[sorted.length - 1]

    setDestaques({
      lider: lider ? { ...perfis[lider[0]], pontos: lider[1].total } : null,
      lanterna: lanterna && sorted.length > 1 ? { ...perfis[lanterna[0]], pontos: lanterna[1].total } : null,
      maiorPontuadorRodada: maiorPontuadorRodada ? {
        ...perfis[maiorPontuadorRodada],
        pontos: maiorPontuacaoRodada,
        rodada: rodadaDestaque,
      } : null,
      maisCravadas: maisClavadasId ? {
        ...perfis[maisClavadasId[0]],
        cravadas: maisClavadasId[1],
      } : null,
      totalJogosEncerrados: partidasEncerradas.size,
    })

    setCarregando(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="text-primary" size={24} />
          Destaques
        </h2>

        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !destaques || destaques.totalJogosEncerrados === 0 ? (
          <div className="card text-center text-gray-500 dark:text-[#8696A0] py-8">
            <p>Os destaques aparecem após o primeiro jogo encerrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {destaques.lider && (
              <CardDestaque
                titulo="Líder do Ranking"
                icon={TrendingUp}
                cor="text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
                nickname={destaques.lider.nickname}
                detalhe={`${destaques.lider.pontos} pontos`}
              />
            )}

            {destaques.maisCravadas && (
              <CardDestaque
                titulo="Mais Cravadas"
                icon={Target}
                cor="text-green-500 bg-green-50 dark:bg-green-500/10"
                nickname={destaques.maisCravadas.nickname}
                detalhe={`${destaques.maisCravadas.cravadas} cravadas`}
              />
            )}

            {destaques.maiorPontuadorRodada && (
              <CardDestaque
                titulo={`Destaque — ${destaques.maiorPontuadorRodada.rodada}`}
                icon={Zap}
                cor="text-blue-500 bg-blue-50 dark:bg-blue-500/10"
                nickname={destaques.maiorPontuadorRodada.nickname}
                detalhe={`${destaques.maiorPontuadorRodada.pontos} pts na rodada`}
              />
            )}

            {destaques.lanterna && (
              <CardDestaque
                titulo="Lanterna"
                icon={TrendingDown}
                cor="text-gray-400 bg-gray-100 dark:bg-[#2A3942]"
                nickname={destaques.lanterna.nickname}
                detalhe={`${destaques.lanterna.pontos} pontos`}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

function CardDestaque({ titulo, icon: Icon, cor, nickname, detalhe }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cor}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{titulo}</p>
          <p className="font-bold">{nickname || '—'}</p>
          <p className="text-sm text-gray-500">{detalhe}</p>
        </div>
      </div>
    </div>
  )
}
