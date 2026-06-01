import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { adminApi } from '../../lib/adminApi'
import { formatarMoeda } from '../../lib/formatters'

export default function AbaFinanceiro() {
  const { perfil } = useAuth()
  const [boloes, setBoloes] = useState([])
  const [participantes, setParticipantes] = useState([])
  const [bolaoSelecionado, setBolaoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    setCarregando(true)
    const { data } = await supabase.from('boloes').select('id, nome, valor_inscricao, valor_arrecadado')
    setBoloes(data || [])
    if (data?.length) {
      setBolaoSelecionado(data[0].id)
      carregarParticipantes(data[0].id)
    }
    setCarregando(false)
  }

  async function carregarParticipantes(bolaoId) {
    try {
      const { data } = await adminApi('listar_participantes', perfil.id, { bolao_id: bolaoId })
      setParticipantes(data || [])
    } catch { setParticipantes([]) }
  }

  async function togglePago(bp) {
    const agora = new Date().toISOString()
    try {
      await adminApi('toggle_pagamento', perfil.id, {
        bolao_id: bp.bolao_id,
        usuario_id: bp.usuario_id,
        pago: !bp.pago,
        data_pagamento: !bp.pago ? agora : null,
      })
      carregarParticipantes(bp.bolao_id)
      await adminApi('recalcular_arrecadado', perfil.id, { bolao_id: bp.bolao_id })
    } catch { /* ignore */ }
  }

  async function atualizarValorPago(bp, valor) {
    try {
      await adminApi('atualizar_valor_pago', perfil.id, {
        bolao_id: bp.bolao_id,
        usuario_id: bp.usuario_id,
        valor_pago: parseFloat(valor) || 0,
      })
      carregarParticipantes(bp.bolao_id)
      await adminApi('recalcular_arrecadado', perfil.id, { bolao_id: bp.bolao_id })
    } catch { /* ignore */ }
  }

  const pagos = participantes.filter(p => p.pago).length
  const totalArrecadado = participantes.filter(p => p.pago).reduce((acc, p) => acc + (p.valor_pago || 0), 0)

  return (
    <div className="space-y-4">
      {boloes.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum bolão criado.</p>
      ) : (
        <>
          <select value={bolaoSelecionado || ''} onChange={e => { setBolaoSelecionado(e.target.value); carregarParticipantes(e.target.value) }} className="input-field">
            {boloes.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center"><p className="text-2xl font-bold">{participantes.length}</p><p className="text-xs text-gray-500">Participantes</p></div>
            <div className="card text-center"><p className="text-2xl font-bold text-green-600">{pagos}</p><p className="text-xs text-gray-500">Pagos</p></div>
            <div className="card text-center"><p className="text-2xl font-bold text-primary">{formatarMoeda(totalArrecadado)}</p><p className="text-xs text-gray-500">Arrecadado</p></div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="py-2">Nome</th><th className="py-2">Valor</th><th className="py-2 text-center">Pago</th><th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {participantes.map(bp => (
                  <tr key={bp.usuario_id} className="border-b border-gray-100">
                    <td className="py-2">{bp.perfis?.nickname || bp.perfis?.nome || '—'}</td>
                    <td className="py-2">
                      <input type="number" step="0.01" min="0" defaultValue={bp.valor_pago || ''} onBlur={e => atualizarValorPago(bp, e.target.value)} className="w-24 text-sm px-2 py-1 rounded border" />
                    </td>
                    <td className="py-2 text-center">
                      <button onClick={() => togglePago(bp)} className={`px-3 py-1 rounded-full text-xs font-semibold ${bp.pago ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{bp.pago ? 'Sim' : 'Não'}</button>
                    </td>
                    <td className="py-2 text-xs text-gray-400">{bp.data_pagamento ? new Date(bp.data_pagamento).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
