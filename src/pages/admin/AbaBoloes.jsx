import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { adminApi } from '../../lib/adminApi'
import { formatarMoeda } from '../../lib/formatters'
import { Users, Plus, Copy, Check } from 'lucide-react'

export default function AbaBoloes() {
  const { perfil } = useAuth()
  const [boloes, setBoloes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorInscricao, setValorInscricao] = useState('')
  const [publico, setPublico] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [copiado, setCopiado] = useState(null)
  const [editando, setEditando] = useState(null)

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    setCarregando(true)
    const { data } = await supabase.from('boloes').select('*, bolao_participantes(count)').order('criado_em', { ascending: false })
    setBoloes(data || [])
    setCarregando(false)
  }

  async function criarBolao(e) {
    e.preventDefault()
    setErro(''); setSucesso('')
    if (!nome.trim()) { setErro('Nome é obrigatório.'); return }

    const codigo = nome.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12) + Math.floor(Math.random() * 1000)

    try {
      await adminApi('criar_bolao', perfil.id, {
        nome: nome.trim(), descricao: descricao.trim() || null,
        codigo_convite: codigo, organizador_id: perfil.id,
        valor_inscricao: parseFloat(valorInscricao) || 0, publico,
      })
      setSucesso('Bolão criado!')
      setNome(''); setDescricao(''); setValorInscricao('')
      carregarBoloes()
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) { setErro(err.message) }
  }

  async function salvarEdicao(bolao) {
    try {
      await adminApi('atualizar_bolao', perfil.id, {
        bolao_id: bolao.id, nome: bolao.nome,
        descricao: bolao.descricao, valor_inscricao: bolao.valor_inscricao, publico: bolao.publico,
      })
      setEditando(null)
      carregarBoloes()
    } catch { /* ignore */ }
  }

  function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={criarBolao} className="card space-y-3">
        <h4 className="font-semibold flex items-center gap-2"><Plus size={16} /> Criar Bolão</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do bolão" className="input-field" />
          <input type="number" step="0.01" min="0" value={valorInscricao} onChange={e => setValorInscricao(e.target.value)} placeholder="Valor inscrição (R$)" className="input-field" />
        </div>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição (opcional)" className="input-field" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publico} onChange={e => setPublico(e.target.checked)} className="rounded" /> Bolão público
          </label>
          <button type="submit" className="btn-primary">Criar</button>
        </div>
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}
      </form>

      {carregando ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {boloes.map(b => {
            const numPart = b.bolao_participantes?.[0]?.count || 0
            if (editando === b.id) {
              return (
                <div key={b.id} className="card space-y-3">
                  <input type="text" defaultValue={b.nome} onChange={e => b.nome = e.target.value} className="input-field" />
                  <input type="text" defaultValue={b.descricao || ''} onChange={e => b.descricao = e.target.value} className="input-field" placeholder="Descrição" />
                  <input type="number" step="0.01" defaultValue={b.valor_inscricao} onChange={e => b.valor_inscricao = parseFloat(e.target.value) || 0} className="input-field" />
                  <div className="flex gap-2">
                    <button onClick={() => salvarEdicao(b)} className="btn-primary text-sm px-4">Salvar</button>
                    <button onClick={() => { setEditando(null); carregarBoloes() }} className="btn-secondary text-sm px-4">Cancelar</button>
                  </div>
                </div>
              )
            }
            return (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold">{b.nome}</h4>
                    {b.descricao && <p className="text-sm text-gray-500 mt-0.5">{b.descricao}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users size={12} /> {numPart} participantes</span>
                      <span>Inscrição: {formatarMoeda(b.valor_inscricao || 0)}</span>
                      <span>{b.publico ? 'Público' : 'Privado'}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditando(b.id)} className="text-primary text-sm font-semibold hover:underline">Editar</button>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A3942] flex items-center justify-between">
                  <div><p className="text-xs text-gray-400">Código de entrada</p><p className="font-mono text-sm font-bold">{b.codigo_convite}</p></div>
                  <button onClick={() => copiarCodigo(b.codigo_convite)} className="flex items-center gap-1 text-primary text-sm hover:underline">
                    {copiado === b.codigo_convite ? <Check size={14} /> : <Copy size={14} />}
                    {copiado === b.codigo_convite ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
