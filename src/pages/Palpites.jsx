import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { palpiteTravado } from '../lib/formatters'
import CartaoPartida from '../components/CartaoPartida'
import Layout from '../components/Layout'

const FASES = [
  { value: 'grupos', label: 'Fase de Grupos' },
  { value: 'oitavas', label: 'Oitavas' },
  { value: 'quartas', label: 'Quartas' },
  { value: 'semi', label: 'Semifinais' },
  { value: 'terceiro', label: '3º Lugar' },
  { value: 'final', label: 'Final' },
]

const GRUPOS = 'ABCDEFGHIJKL'.split('')

export default function Palpites() {
  const { perfil } = useAuth()
  const [partidas, setPartidas] = useState([])
  const [palpites, setPalpites] = useState({})
  const [selecoes, setSelecoes] = useState({})
  const [faseAtiva, setFaseAtiva] = useState('grupos')
  const [grupoAtivo, setGrupoAtivo] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()

    const channel = supabase
      .channel('partidas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
        carregarDados()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function carregarDados() {
    setCarregando(true)
    const [selRes, partidasRes, palpitesRes] = await Promise.all([
      supabase.from('selecoes').select('*'),
      supabase.from('partidas').select('*').order('data_hora', { ascending: true }),
      supabase.from('palpites').select('*').eq('usuario_id', perfil.id),
    ])

    if (selRes.data) {
      const map = {}
      selRes.data.forEach(s => { map[s.id] = s })
      setSelecoes(map)
    }

    if (partidasRes.data) setPartidas(partidasRes.data)

    if (palpitesRes.data) {
      const map = {}
      palpitesRes.data.forEach(p => { map[p.partida_id] = p })
      setPalpites(map)
    }

    setCarregando(false)
  }

  async function salvarPalpite(partidaId, placarCasa, placarFora) {
    const existente = palpites[partidaId]

    if (existente) {
      const { data, error } = await supabase
        .from('palpites')
        .update({ placar_casa: placarCasa, placar_fora: placarFora, atualizado_em: new Date().toISOString() })
        .eq('id', existente.id)
        .select()
        .single()

      if (!error && data) {
        setPalpites(prev => ({ ...prev, [partidaId]: data }))
      }
    } else {
      const { data, error } = await supabase
        .from('palpites')
        .insert({
          usuario_id: perfil.id,
          partida_id: partidaId,
          placar_casa: placarCasa,
          placar_fora: placarFora,
        })
        .select()
        .single()

      if (!error && data) {
        setPalpites(prev => ({ ...prev, [partidaId]: data }))
      }
    }
  }

  const partidasFiltradas = partidas.filter(p => {
    if (p.fase !== faseAtiva) return false
    if (faseAtiva === 'grupos' && grupoAtivo && p.grupo !== grupoAtivo) return false
    return true
  })

  const totalPalpitaveis = partidas.filter(p => !palpiteTravado(p.data_hora)).length
  const totalPalpitados = partidas.filter(p => palpites[p.id] && !palpiteTravado(p.data_hora)).length

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Palpites</h2>
          <span className="text-sm text-gray-500">
            {Object.keys(palpites).length} / {partidas.length} jogos
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {FASES.map(fase => (
            <button
              key={fase.value}
              onClick={() => { setFaseAtiva(fase.value); setGrupoAtivo(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                faseAtiva === fase.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {fase.label}
            </button>
          ))}
        </div>

        {faseAtiva === 'grupos' && (
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            <button
              onClick={() => setGrupoAtivo(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !grupoAtivo ? 'bg-dark text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {GRUPOS.map(g => (
              <button
                key={g}
                onClick={() => setGrupoAtivo(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  grupoAtivo === g ? 'bg-dark text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : partidasFiltradas.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            <p>Nenhum jogo nesta fase ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partidasFiltradas.map(partida => (
              <CartaoPartida
                key={partida.id}
                partida={partida}
                palpite={palpites[partida.id]}
                onSalvarPalpite={salvarPalpite}
                selecoes={selecoes}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
