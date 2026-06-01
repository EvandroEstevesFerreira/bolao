import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../lib/adminApi'

export default function AbaDashboard() {
  const { perfil } = useAuth()
  const [stats, setStats] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarStats() }, [])

  async function carregarStats() {
    setCarregando(true)
    try {
      const data = await adminApi('dashboard_stats', perfil.id)
      const perfis = data.perfis || []
      const palpites = data.palpites || []
      const partidas = data.partidas || []
      const bp = data.bp || []

      const ativos = perfis.filter(p => p.ativo).length
      const encerrados = partidas.filter(p => p.status === 'encerrado').length
      const pagos = bp.filter(p => p.pago).length
      const palpitanteUnicos = new Set(palpites.map(p => p.usuario_id)).size

      const palpitesPorJogo = {}
      palpites.forEach(p => { palpitesPorJogo[p.partida_id] = (palpitesPorJogo[p.partida_id] || 0) + 1 })

      setStats({
        totalPerfis: perfis.length, ativos, encerrados,
        totalPartidas: partidas.length, pagos, totalBP: bp.length,
        palpitanteUnicos,
        mediaPalpitesPorJogo: encerrados > 0
          ? Math.round(Object.values(palpitesPorJogo).reduce((a, b) => a + b, 0) / Math.max(Object.keys(palpitesPorJogo).length, 1))
          : 0,
      })
    } catch { /* ignore */ }
    setCarregando(false)
  }

  if (carregando) return (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center"><p className="text-2xl font-bold">{stats.totalPerfis}</p><p className="text-xs text-gray-500">Cadastrados</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-600">{stats.ativos}</p><p className="text-xs text-gray-500">Ativos</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-blue-600">{stats.palpitanteUnicos}</p><p className="text-xs text-gray-500">Palpitando</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-primary">{stats.pagos}/{stats.totalBP}</p><p className="text-xs text-gray-500">Pagamentos</p></div>
      </div>

      <div className="card">
        <h4 className="font-semibold mb-3">Progresso do Torneio</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div className="bg-primary rounded-full h-3 transition-all" style={{ width: `${(stats.encerrados / Math.max(stats.totalPartidas, 1)) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold">{stats.encerrados}/{stats.totalPartidas}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">jogos encerrados</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500">Média de palpites por jogo: <strong>{stats.mediaPalpitesPorJogo}</strong></p>
      </div>
    </div>
  )
}
