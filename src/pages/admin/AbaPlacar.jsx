import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { adminApi } from '../../lib/adminApi'
import { RefreshCw } from 'lucide-react'

export default function AbaPlacar() {
  const { perfil } = useAuth()
  const [partidas, setPartidas] = useState([])
  const [selecoes, setSelecoes] = useState({})
  const [editando, setEditando] = useState(null)
  const [placarCasa, setPlacarCasa] = useState('')
  const [placarFora, setPlacarFora] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [sincronizando, setSincronizando] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const [pRes, sRes] = await Promise.all([
      supabase.from('partidas').select('id, selecao_casa_id, selecao_fora_id, placar_casa, placar_fora, status, data_hora, rodada').order('data_hora'),
      supabase.from('selecoes').select('id, nome, codigo_fifa'),
    ])
    setPartidas(pRes.data || [])
    const map = {}
    sRes.data?.forEach(s => { map[s.id] = s })
    setSelecoes(map)
  }

  async function sincronizarResultados() {
    setSincronizando(true)
    setSyncResult(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sincronizar-resultados`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
      setSyncResult({ ok: true, ...data })
      carregarDados()
    } catch (err) {
      setSyncResult({ ok: false, error: err.message })
    } finally {
      setSincronizando(false)
      setTimeout(() => setSyncResult(null), 8000)
    }
  }

  async function salvarPlacar(partida) {
    const pc = parseInt(placarCasa)
    const pf = parseInt(placarFora)
    if (isNaN(pc) || isNaN(pf)) return

    try {
      await adminApi('atualizar_placar', perfil.id, {
        partida_id: partida.id,
        placar_casa: pc,
        placar_fora: pf,
        status: 'encerrado',
      })
      setEditando(null)
      carregarDados()
    } catch (err) {
      alert(err.message)
    }
  }

  const filtradas = partidas.filter(p => filtroStatus === 'todos' || p.status === filtroStatus)

  return (
    <div className="space-y-3">
      <div className="card flex items-center justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2">
            <RefreshCw size={16} className={sincronizando ? 'animate-spin' : ''} />
            Sincronizar com API
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">Atualiza placares automaticamente via SportAPI7</p>
        </div>
        <button onClick={sincronizarResultados} disabled={sincronizando} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
          {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {syncResult && (
        <div className={`card text-sm ${syncResult.ok ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
          {syncResult.ok ? (
            <p className="text-green-700 dark:text-green-300">Sincronizado! {syncResult.totalEventos} eventos, {syncResult.atualizados} atualizados, {syncResult.pontosRecalculados} pontos recalculados.</p>
          ) : (
            <p className="text-red-700 dark:text-red-300">Erro: {syncResult.error}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {['todos', 'agendado', 'ao_vivo', 'encerrado'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} className={`px-3 py-1 rounded-full text-xs font-semibold ${filtroStatus === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
            {s === 'todos' ? 'Todos' : s === 'agendado' ? 'Agendado' : s === 'ao_vivo' ? 'Ao Vivo' : 'Encerrado'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtradas.map(p => (
          <div key={p.id} className="card flex items-center justify-between py-3">
            <div className="text-sm">
              <span className="font-semibold">{selecoes[p.selecao_casa_id]?.codigo_fifa || '?'}</span>
              {' '}{p.status === 'encerrado' ? `${p.placar_casa} × ${p.placar_fora}` : 'vs'}{' '}
              <span className="font-semibold">{selecoes[p.selecao_fora_id]?.codigo_fifa || '?'}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.status === 'encerrado' ? 'bg-gray-100 text-gray-600' : p.status === 'ao_vivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span>
            </div>
            {editando === p.id ? (
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={placarCasa} onChange={e => setPlacarCasa(e.target.value)} className="w-12 h-8 text-center text-sm rounded border" />
                <span>×</span>
                <input type="number" min="0" value={placarFora} onChange={e => setPlacarFora(e.target.value)} className="w-12 h-8 text-center text-sm rounded border" />
                <button onClick={() => salvarPlacar(p)} className="text-green-600 text-sm font-semibold">Salvar</button>
                <button onClick={() => setEditando(null)} className="text-gray-400 text-sm">×</button>
              </div>
            ) : (
              <button onClick={() => { setEditando(p.id); setPlacarCasa(p.placar_casa ?? ''); setPlacarFora(p.placar_fora ?? '') }} className="text-primary text-sm font-semibold hover:underline">Editar</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
