import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { adminApi } from '../../lib/adminApi'
import { formatarMoeda } from '../../lib/formatters'

export default function AbaPremiacao() {
  const { perfil } = useAuth()
  const [boloes, setBoloes] = useState([])
  const [bolaoId, setBolaoId] = useState(null)
  const [regras, setRegras] = useState([])
  const [novaPos, setNovaPos] = useState('')
  const [novoPerc, setNovoPerc] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    const { data } = await supabase.from('boloes').select('id, nome, valor_inscricao, valor_arrecadado')
    setBoloes(data || [])
    if (data?.length) { setBolaoId(data[0].id); carregarRegras(data[0].id) }
  }

  async function carregarRegras(bid) {
    const { data } = await supabase.from('premiacao_regras').select('posicao, percentual').eq('bolao_id', bid).order('posicao')
    setRegras(data || [])
  }

  async function adicionarRegra() {
    setErro(''); setSucesso('')
    const pos = parseInt(novaPos)
    const perc = parseFloat(novoPerc)
    if (!bolaoId) { setErro('Selecione um bolão.'); return }
    if (isNaN(pos) || pos < 1) { setErro('Posição deve ser > 0.'); return }
    if (isNaN(perc) || perc <= 0 || perc > 100) { setErro('Percentual entre 0.01 e 100.'); return }

    setSalvando(true)
    try {
      await adminApi('salvar_premiacao', perfil.id, { bolao_id: bolaoId, posicao: pos, percentual: perc })
      setSucesso(`${pos}º lugar — ${perc}% salvo!`)
      setNovaPos(''); setNovoPerc('')
      carregarRegras(bolaoId)
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) { setErro(err.message) }
    setSalvando(false)
  }

  async function removerRegra(posicao) {
    try {
      await adminApi('remover_premiacao', perfil.id, { bolao_id: bolaoId, posicao })
      setSucesso(`${posicao}º lugar removido.`)
      carregarRegras(bolaoId)
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) { setErro(err.message) }
  }

  const totalPerc = regras.reduce((acc, r) => acc + (r.percentual || 0), 0)
  const bolao = boloes.find(b => b.id === bolaoId)

  return (
    <div className="space-y-4">
      {boloes.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum bolão criado.</p>
      ) : (
        <>
          <select value={bolaoId || ''} onChange={e => { setBolaoId(e.target.value); carregarRegras(e.target.value) }} className="input-field">
            {boloes.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>

          {bolao && (
            <div className="card text-sm space-y-2">
              <p>Valor inscrição: <strong>{formatarMoeda(bolao.valor_inscricao)}</strong></p>
              <p>Arrecadado: <strong>{formatarMoeda(bolao.valor_arrecadado)}</strong></p>
            </div>
          )}

          <div className="card">
            <h4 className="font-semibold mb-3">Regras de Premiação</h4>
            <div className="space-y-2 mb-4">
              {regras.map(r => (
                <div key={r.posicao} className="flex items-center justify-between text-sm">
                  <span>{r.posicao}º lugar — <strong>{r.percentual}%</strong></span>
                  {bolao && <span className="text-gray-500">{formatarMoeda(bolao.valor_arrecadado * r.percentual / 100)}</span>}
                  <button onClick={() => removerRegra(r.posicao)} className="text-red-500 text-xs">Remover</button>
                </div>
              ))}
              {regras.length === 0 && <p className="text-gray-400 text-sm">Nenhuma regra configurada.</p>}
            </div>

            <p className={`text-sm mb-3 ${Math.abs(totalPerc - 100) < 0.01 ? 'text-green-600' : 'text-orange-500'}`}>
              Total: {totalPerc.toFixed(2)}% {Math.abs(totalPerc - 100) < 0.01 ? '✓' : '(deve somar 100%)'}
            </p>

            <div className="flex gap-2">
              <input type="number" min="1" placeholder="Posição" value={novaPos} onChange={e => setNovaPos(e.target.value)} className="w-24 input-field text-sm" />
              <input type="number" step="0.01" min="0" max="100" placeholder="%" value={novoPerc} onChange={e => setNovoPerc(e.target.value)} className="w-24 input-field text-sm" />
              <button onClick={adicionarRegra} disabled={salvando} className="btn-primary text-sm px-4 disabled:opacity-50">{salvando ? 'Salvando...' : 'Adicionar'}</button>
            </div>

            {erro && <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">{erro}</p>}
            {sucesso && <p className="mt-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">{sucesso}</p>}
          </div>
        </>
      )}
    </div>
  )
}
