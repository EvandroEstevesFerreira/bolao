import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Swords, Trophy, Target, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'

export default function CaraACara() {
  const { perfil } = useAuth()
  const [jogadores, setJogadores] = useState([])
  const [oponente, setOponente] = useState(null)
  const [comparacao, setComparacao] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarJogadores()
  }, [])

  async function carregarJogadores() {
    const { data } = await supabase
      .from('perfis')
      .select('id, nickname, avatar_url, setor_cr')
      .eq('ativo', true)
      .neq('id', perfil.id)
      .order('nickname')
    setJogadores(data || [])
  }

  async function compararCom(jogador) {
    setOponente(jogador)
    setCarregando(true)

    const [meusPalpites, palpitesOponente, partidas] = await Promise.all([
      supabase.from('palpites').select('partida_id, placar_casa, placar_fora, pontos').eq('usuario_id', perfil.id),
      supabase.from('palpites').select('partida_id, placar_casa, placar_fora, pontos').eq('usuario_id', jogador.id),
      supabase.from('partidas').select('id, status').eq('status', 'encerrado'),
    ])

    const meusMap = {}
    meusPalpites.data?.forEach(p => { meusMap[p.partida_id] = p })
    const opoMap = {}
    palpitesOponente.data?.forEach(p => { opoMap[p.partida_id] = p })

    const jogosEncerrados = new Set((partidas.data || []).map(p => p.id))

    let meuTotal = 0, opoTotal = 0
    let meuCravadas = 0, opoCravadas = 0
    let meuVitorias = 0, opoVitorias = 0, empates = 0
    let jogosComuns = 0

    jogosEncerrados.forEach(partidaId => {
      const meu = meusMap[partidaId]
      const opo = opoMap[partidaId]
      if (!meu && !opo) return

      jogosComuns++
      const meuPts = meu?.pontos || 0
      const opoPts = opo?.pontos || 0

      meuTotal += meuPts
      opoTotal += opoPts

      if (meuPts === 10) meuCravadas++
      if (opoPts === 10) opoCravadas++

      if (meuPts > opoPts) meuVitorias++
      else if (opoPts > meuPts) opoVitorias++
      else empates++
    })

    setComparacao({
      meuTotal, opoTotal,
      meuCravadas, opoCravadas,
      meuVitorias, opoVitorias, empates,
      jogosComuns,
    })
    setCarregando(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Swords className="text-primary" size={24} />
          Cara a Cara
        </h2>

        {!oponente ? (
          <>
            <p className="text-gray-500 text-sm">Escolha um oponente para comparar:</p>
            <div className="space-y-2">
              {jogadores.map(j => (
                <button
                  key={j.id}
                  onClick={() => compararCom(j)}
                  className="card w-full flex items-center gap-3 py-3 hover:shadow-md transition-shadow text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-200">
                    {j.avatar_url ? (
                      <img src={j.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      j.nickname?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{j.nickname}</p>
                    {j.setor_cr && <p className="text-xs text-gray-400">{j.setor_cr}</p>}
                  </div>
                </button>
              ))}
              {jogadores.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhum outro jogador cadastrado.</p>
              )}
            </div>
          </>
        ) : carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comparacao ? (
          <div className="space-y-4">
            <button
              onClick={() => { setOponente(null); setComparacao(null) }}
              className="text-primary text-sm font-semibold hover:underline"
            >
              ← Escolher outro oponente
            </button>

            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {perfil.nickname?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{perfil.nickname}</p>
                </div>

                <div className="px-4">
                  <Swords className="text-gray-400" size={32} />
                </div>

                <div className="text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-gray-600">
                      {oponente.nickname?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{oponente.nickname}</p>
                </div>
              </div>

              <div className="space-y-3">
                <LinhaComparacao
                  label="Pontos totais"
                  icon={TrendingUp}
                  meu={comparacao.meuTotal}
                  opo={comparacao.opoTotal}
                />
                <LinhaComparacao
                  label="Cravadas"
                  icon={Target}
                  meu={comparacao.meuCravadas}
                  opo={comparacao.opoCravadas}
                />
                <LinhaComparacao
                  label="Vitórias (jogo a jogo)"
                  icon={Trophy}
                  meu={comparacao.meuVitorias}
                  opo={comparacao.opoVitorias}
                />

                <div className="text-center pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {comparacao.jogosComuns} jogos comparados · {comparacao.empates} empates
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

function LinhaComparacao({ label, icon: Icon, meu, opo }) {
  const meuGanha = meu > opo
  const opoGanha = opo > meu

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 text-right ${meuGanha ? 'font-bold text-primary' : ''}`}>
        <span className="text-lg">{meu}</span>
      </div>
      <div className="w-24 text-center">
        <Icon size={14} className="text-gray-400 mx-auto mb-0.5" />
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
      </div>
      <div className={`flex-1 text-left ${opoGanha ? 'font-bold text-primary' : ''}`}>
        <span className="text-lg">{opo}</span>
      </div>
    </div>
  )
}
