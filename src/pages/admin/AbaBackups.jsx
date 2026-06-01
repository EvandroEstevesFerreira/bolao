import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { adminApi } from '../../lib/adminApi'
import { Database, Download } from 'lucide-react'

export default function AbaBackups() {
  const { perfil } = useAuth()
  const [backups, setBackups] = useState([])
  const [rodadas, setRodadas] = useState([])
  const [rodadaSelecionada, setRodadaSelecionada] = useState('')
  const [criando, setCriando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [resultado, setResultado] = useState(null)

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    setCarregando(true)
    const [bRes, pRes] = await Promise.all([
      adminApi('listar_backups', perfil.id).catch(() => ({ data: [] })),
      supabase.from('partidas').select('rodada, status'),
    ])
    setBackups(bRes.data || [])
    const rods = [...new Set((pRes.data || []).map(p => p.rodada).filter(Boolean))].sort()
    setRodadas(rods)
    if (rods.length > 0 && !rodadaSelecionada) setRodadaSelecionada(rods[0])
    setCarregando(false)
  }

  async function criarBackup() {
    if (!rodadaSelecionada) return
    setCriando(true)
    setResultado(null)
    try {
      const result = await adminApi('criar_backup', perfil.id, { rodada: rodadaSelecionada, criado_por: perfil.id })
      setResultado({ ok: true, msg: `Backup da "${rodadaSelecionada}" criado: ${result.total_partidas} partidas, ${result.total_palpites} palpites.` })
      carregarDados()
    } catch (err) {
      setResultado({ ok: false, error: err.message })
    }
    setCriando(false)
  }

  function exportarJson(backup) {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_${backup.rodada.replace(/\s+/g, '_')}_${new Date(backup.criado_em).toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h4 className="font-semibold flex items-center gap-2 mb-3"><Database size={16} /> Criar Backup de Rodada</h4>
        <p className="text-xs text-gray-500 dark:text-[#8696A0] mb-3">Salva um snapshot completo: partidas, palpites e ranking.</p>
        <div className="flex items-center gap-3">
          <select value={rodadaSelecionada} onChange={e => setRodadaSelecionada(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3B4A54] bg-white dark:bg-[#2A3942] text-sm">
            {rodadas.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={criarBackup} disabled={criando || !rodadaSelecionada} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap">
            {criando ? 'Criando...' : 'Criar Backup'}
          </button>
        </div>
        {resultado && (
          <div className={`mt-3 text-sm rounded-lg p-3 ${resultado.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
            {resultado.ok ? resultado.msg : `Erro: ${resultado.error}`}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-sm">Backups anteriores</h4>

      {carregando ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : backups.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">Nenhum backup criado ainda.</p>
      ) : (
        <div className="space-y-2">
          {backups.map(b => (
            <div key={b.id} className="card flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-sm">{b.rodada}</p>
                <p className="text-xs text-gray-500">{new Date(b.criado_em).toLocaleString('pt-BR')} · {b.tipo} · {b.total_partidas} partidas · {b.total_palpites} palpites</p>
              </div>
              <button onClick={() => exportarJson(b)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A3942] text-gray-500" title="Exportar JSON"><Download size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
