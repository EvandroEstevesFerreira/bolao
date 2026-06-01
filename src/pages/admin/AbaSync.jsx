import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../lib/adminApi'
import { Activity, RefreshCw } from 'lucide-react'

export default function AbaSync() {
  const { perfil } = useAuth()
  const [logs, setLogs] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [reqHoje, setReqHoje] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const LIMITE = 80

  useEffect(() => { carregarLogs() }, [])

  async function carregarLogs() {
    setCarregando(true)
    try {
      const { data } = await adminApi('listar_sync_logs', perfil.id)
      setLogs(data || [])
      const hoje = (data || []).filter(l => l.criado_em && new Date(l.criado_em).toDateString() === new Date().toDateString() && !l.erro)
      setReqHoje(hoje.reduce((acc, l) => acc + (l.requisicoes_api || 0), 0))
    } catch { /* ignore */ }
    setCarregando(false)
  }

  async function forcarSync() {
    setSincronizando(true)
    setResultado(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) setResultado({ ok: false, msg: data.error || `Erro ${res.status}` })
      else { setResultado({ ok: true, data }); carregarLogs() }
    } catch (err) { setResultado({ ok: false, msg: String(err) }) }
    setSincronizando(false)
  }

  const percentual = Math.min((reqHoje / LIMITE) * 100, 100)

  return (
    <div className="space-y-4">
      <div className="card">
        <h4 className="font-semibold flex items-center gap-2 mb-3"><Activity size={16} /> Uso da API Hoje</h4>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-gray-200 dark:bg-[#2A3942] rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${percentual > 90 ? 'bg-red-500' : percentual > 70 ? 'bg-yellow-500' : 'bg-primary'}`} style={{ width: `${percentual}%` }} />
          </div>
          <span className="text-sm font-semibold tabular-nums">{reqHoje}/{LIMITE}</span>
        </div>
        <p className="text-xs text-gray-500">{LIMITE - reqHoje} requisições restantes hoje.</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div><h4 className="font-semibold text-sm">Sincronização Manual</h4><p className="text-xs text-gray-500">Forçar sync agora</p></div>
          <button onClick={forcarSync} disabled={sincronizando || reqHoje >= LIMITE} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCw size={14} className={sincronizando ? 'animate-spin' : ''} /> {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
        {resultado && (
          <div className={`mt-3 text-sm rounded-lg p-3 ${resultado.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
            {resultado.ok ? (resultado.data?.skipped ? `Pulado: ${resultado.data.reason}` : `OK! ${resultado.data.atualizados || 0} atualizados, ${resultado.data.pontosRecalculados || 0} pontos`) : resultado.msg}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-sm">Histórico</h4>

      {carregando ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {logs.map(l => (
            <div key={l.id} className={`card py-3 ${l.erro ? 'border-red-200 dark:border-red-800' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${l.erro ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-sm font-semibold">{l.tipo}</span>
                <span className="text-xs text-gray-400">{new Date(l.criado_em).toLocaleString('pt-BR')}</span>
              </div>
              {l.erro ? (
                <p className="text-xs text-red-500 mt-1">{l.erro}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">{l.requisicoes_api} req · {l.eventos_processados} eventos · {l.atualizados} atualizados · {l.pontos_recalculados} pontos</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
