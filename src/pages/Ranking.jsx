import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Medal, TrendingUp, DollarSign } from 'lucide-react'
import { formatarMoeda } from '../lib/formatters'
import Layout from '../components/Layout'

export default function Ranking() {
  const { perfil } = useAuth()
  const [ranking, setRanking] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState('geral')
  const [premiacao, setPremiacao] = useState({ regras: [], arrecadado: 0 })

  useEffect(() => {
    carregarRanking()

    const channel = supabase
      .channel('palpites-ranking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'palpites' }, () => {
        carregarRanking()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function carregarRanking() {
    setCarregando(true)

    const [palpitesRes, perfisRes, boloesRes, regrasRes, bonusRes] = await Promise.all([
      supabase.from('palpites').select('usuario_id, pontos'),
      supabase.from('perfis').select('id, nickname, avatar_url, setor_cr').eq('ativo', true),
      supabase.from('boloes').select('id, valor_arrecadado').limit(1).single(),
      supabase.from('premiacao_regras').select('*').order('posicao'),
      supabase.from('palpites_bonus').select('usuario_id, pontos'),
    ])

    if (!palpitesRes.data || !perfisRes.data) {
      setCarregando(false)
      return
    }

    const perfisMap = {}
    perfisRes.data.forEach(p => { perfisMap[p.id] = p })

    const bonusMap = {}
    bonusRes.data?.forEach(b => {
      bonusMap[b.usuario_id] = (bonusMap[b.usuario_id] || 0) + (b.pontos || 0)
    })

    const stats = {}
    palpitesRes.data.forEach(p => {
      if (!stats[p.usuario_id]) {
        stats[p.usuario_id] = {
          totalPontos: 0,
          cravadas: 0,
          pontos7: 0,
          pontos5: 0,
          pontos2: 0,
          totalPalpites: 0,
          bonusCampeao: 0,
        }
      }
      const s = stats[p.usuario_id]
      s.totalPontos += p.pontos || 0
      s.totalPalpites++
      if (p.pontos === 10) s.cravadas++
      else if (p.pontos === 7) s.pontos7++
      else if (p.pontos === 5) s.pontos5++
      else if (p.pontos === 2) s.pontos2++
    })

    Object.entries(bonusMap).forEach(([uid, pts]) => {
      if (!stats[uid]) {
        stats[uid] = { totalPontos: 0, cravadas: 0, pontos7: 0, pontos5: 0, pontos2: 0, totalPalpites: 0, bonusCampeao: 0 }
      }
      stats[uid].bonusCampeao = pts
      stats[uid].totalPontos += pts
    })

    const rankingList = Object.entries(stats)
      .filter(([id]) => perfisMap[id])
      .map(([id, s]) => ({
        ...s,
        perfil: perfisMap[id],
      }))
      .sort((a, b) => {
        if (b.totalPontos !== a.totalPontos) return b.totalPontos - a.totalPontos
        if (b.cravadas !== a.cravadas) return b.cravadas - a.cravadas
        if (b.pontos7 !== a.pontos7) return b.pontos7 - a.pontos7
        if (b.pontos5 !== a.pontos5) return b.pontos5 - a.pontos5
        if (b.pontos2 !== a.pontos2) return b.pontos2 - a.pontos2
        if (b.totalPalpites !== a.totalPalpites) return b.totalPalpites - a.totalPalpites
        return (b.bonusCampeao || 0) - (a.bonusCampeao || 0)
      })

    setRanking(rankingList)
    setPremiacao({
      regras: regrasRes.data || [],
      arrecadado: boloesRes.data?.valor_arrecadado || 0,
    })
    setCarregando(false)
  }

  function getPremioPosicao(pos) {
    const regra = premiacao.regras.find(r => r.posicao === pos + 1)
    if (!regra || !premiacao.arrecadado) return null
    return premiacao.arrecadado * regra.percentual / 100
  }

  const rankingFiltrado = filtro === 'geral'
    ? ranking
    : ranking.filter(r => r.perfil.setor_cr === filtro)

  const setores = [...new Set(ranking.map(r => r.perfil.setor_cr).filter(Boolean))]

  function getMedalha(pos) {
    if (pos === 0) return <Trophy className="text-yellow-500" size={20} />
    if (pos === 1) return <Medal className="text-gray-400" size={20} />
    if (pos === 2) return <Medal className="text-amber-600" size={20} />
    return <span className="w-5 text-center text-sm font-bold text-gray-400">{pos + 1}</span>
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Ranking</h2>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltro('geral')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filtro === 'geral' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Geral
          </button>
          {setores.map(setor => (
            <button
              key={setor}
              onClick={() => setFiltro(setor)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filtro === setor ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {setor}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rankingFiltrado.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            <p>Nenhum participante com palpites ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankingFiltrado.map((item, idx) => {
              const isMe = item.perfil.id === perfil.id
              return (
                <div
                  key={item.perfil.id}
                  className={`card flex items-center gap-3 py-3 ${
                    isMe ? 'ring-2 ring-primary bg-red-50' : ''
                  } ${idx < 3 ? 'shadow-md' : ''}`}
                >
                  <div className="w-8 flex justify-center">
                    {getMedalha(idx)}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden flex-shrink-0">
                    {item.perfil.avatar_url ? (
                      <img src={item.perfil.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.perfil.nickname?.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {item.perfil.nickname}
                      {isMe && <span className="text-primary ml-1">(você)</span>}
                    </p>
                    {item.perfil.setor_cr && (
                      <p className="text-xs text-gray-400">{item.perfil.setor_cr}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">{item.totalPontos}</p>
                    <p className="text-xs text-gray-400">
                      {item.cravadas > 0 && `${item.cravadas}🎯`} {item.totalPalpites} jogos
                    </p>
                    {getPremioPosicao(idx) && (
                      <p className="text-xs text-green-600 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                        <DollarSign size={10} />
                        {formatarMoeda(getPremioPosicao(idx))}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
