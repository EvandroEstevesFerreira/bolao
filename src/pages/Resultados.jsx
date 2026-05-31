import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatarDataHora } from '../lib/formatters'
import { Tv, Clock } from 'lucide-react'
import Layout from '../components/Layout'

export default function Resultados() {
  const [partidas, setPartidas] = useState([])
  const [selecoes, setSelecoes] = useState({})
  const [filtro, setFiltro] = useState('todos')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()

    const channel = supabase
      .channel('resultados-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidas' }, () => {
        carregarDados()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function carregarDados() {
    setCarregando(true)
    const [pRes, sRes] = await Promise.all([
      supabase.from('partidas').select('*').order('data_hora', { ascending: false }),
      supabase.from('selecoes').select('*'),
    ])

    setPartidas(pRes.data || [])
    const map = {}
    sRes.data?.forEach(s => { map[s.id] = s })
    setSelecoes(map)
    setCarregando(false)
  }

  const filtradas = partidas.filter(p => {
    if (filtro === 'ao_vivo') return p.status === 'ao_vivo'
    if (filtro === 'encerrado') return p.status === 'encerrado'
    if (filtro === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0]
      return p.data_hora?.startsWith(hoje)
    }
    return true
  })

  const aoVivo = partidas.filter(p => p.status === 'ao_vivo')

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tv className="text-primary" size={24} />
          Resultados ao Vivo
        </h2>

        {aoVivo.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Jogos ao vivo agora
            </h3>
            {aoVivo.map(p => (
              <CartaoResultado key={p.id} partida={p} selecoes={selecoes} />
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { v: 'todos', l: 'Todos' },
            { v: 'ao_vivo', l: 'Ao Vivo' },
            { v: 'hoje', l: 'Hoje' },
            { v: 'encerrado', l: 'Encerrados' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFiltro(f.v)}
              className={`chip ${filtro === f.v ? 'chip-active' : 'chip-inactive'}`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            <p>Nenhum resultado encontrado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map(p => (
              <CartaoResultado key={p.id} partida={p} selecoes={selecoes} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function CartaoResultado({ partida, selecoes }) {
  const casa = selecoes[partida.selecao_casa_id]
  const fora = selecoes[partida.selecao_fora_id]
  const aoVivo = partida.status === 'ao_vivo'
  const encerrado = partida.status === 'encerrado'

  return (
    <div className={`card py-4 ${aoVivo ? 'border-2 border-green-400 shadow-green-100 dark:shadow-green-500/5' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {partida.rodada} · {partida.grupo ? `Grupo ${partida.grupo}` : partida.fase}
        </span>
        {aoVivo && (
          <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">
            AO VIVO
          </span>
        )}
        {encerrado && (
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs dark:bg-[#2A3942] dark:text-[#8696A0]">
            Encerrado
          </span>
        )}
        {!aoVivo && !encerrado && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {formatarDataHora(partida.data_hora)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {casa?.bandeira_url && (
            <img src={casa.bandeira_url} alt="" className="w-8 h-6 rounded object-cover" />
          )}
          <span className="font-semibold text-sm">{casa?.nome || 'TBD'}</span>
        </div>

        <div className="px-4 text-center min-w-[80px]">
          {encerrado || aoVivo ? (
            <span className="text-2xl font-bold">
              {partida.placar_casa ?? '-'} × {partida.placar_fora ?? '-'}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-[#8696A0] text-sm">vs</span>
          )}
          {partida.decidido_penaltis && (
            <p className="text-xs text-gray-500 mt-0.5">
              (pen: {partida.placar_casa_prorrogacao}×{partida.placar_fora_prorrogacao})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-semibold text-sm">{fora?.nome || 'TBD'}</span>
          {fora?.bandeira_url && (
            <img src={fora.bandeira_url} alt="" className="w-8 h-6 rounded object-cover" />
          )}
        </div>
      </div>

      {partida.estadio && (
        <p className="text-xs text-gray-400 dark:text-[#8696A0] text-center mt-2">
          {partida.estadio} — {partida.cidade}
        </p>
      )}
    </div>
  )
}
