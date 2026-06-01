import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../lib/adminApi'
import { Plus, Copy, Check } from 'lucide-react'

export default function AbaConvites() {
  const { perfil } = useAuth()
  const [convites, setConvites] = useState([])
  const [copiado, setCopiado] = useState(null)
  const [qtd, setQtd] = useState(1)

  useEffect(() => { carregarConvites() }, [])

  async function carregarConvites() {
    try {
      const { data } = await adminApi('listar_convites', perfil.id)
      setConvites(data || [])
    } catch { /* ignore */ }
  }

  async function gerarConvites() {
    const novos = []
    for (let i = 0; i < qtd; i++) {
      novos.push({
        token: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
        criado_por: perfil.id,
        expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    try {
      await adminApi('gerar_convites', perfil.id, { convites: novos })
      carregarConvites()
    } catch { /* ignore */ }
  }

  function copiarLink(token) {
    const url = `${window.location.origin}/convite?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiado(token)
    setTimeout(() => setCopiado(null), 2000)
  }

  const usados = convites.filter(c => c.usado_em).length
  const disponiveis = convites.filter(c => !c.usado_em).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input type="number" min="1" max="50" value={qtd} onChange={e => setQtd(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 input-field text-center" />
        <button onClick={gerarConvites} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Gerar {qtd > 1 ? `${qtd} Convites` : 'Convite'}
        </button>
      </div>

      <div className="flex gap-4 text-sm text-gray-500">
        <span>Total: {convites.length}</span>
        <span>Usados: {usados}</span>
        <span>Disponíveis: {disponiveis}</span>
      </div>

      <div className="space-y-2">
        {convites.map(c => (
          <div key={c.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-mono text-sm">{c.token}</p>
              <p className="text-xs text-gray-400">
                {c.usado_em ? `Usado em ${new Date(c.usado_em).toLocaleDateString('pt-BR')}` : 'Disponível'}
                {c.cpf && ` · CPF: ***.***.${c.cpf.slice(6, 9)}-**`}
              </p>
            </div>
            <button onClick={() => copiarLink(c.token)} disabled={!!c.usado_em} className={`p-2 rounded-lg transition-colors ${c.usado_em ? 'text-gray-300' : 'text-primary hover:bg-primary/10'}`}>
              {copiado === c.token ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
