import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { validarCPF, limparCPF, formatarCPF } from '../lib/cpf'
import { formatarMoeda } from '../lib/formatters'
import { calcularPontos } from '../lib/pontuacao'
import { Users, Link2, Trophy, Settings, Plus, Copy, Check, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'

function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novoCpf, setNovoCpf] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => { carregarUsuarios() }, [])

  async function carregarUsuarios() {
    setCarregando(true)
    const { data } = await supabase.from('perfis').select('*').order('criado_em', { ascending: false })
    setUsuarios(data || [])
    setCarregando(false)
  }

  async function cadastrarUsuario(e) {
    e.preventDefault()
    setErro(''); setSucesso('')
    const cpf = limparCPF(novoCpf)
    if (!validarCPF(cpf)) { setErro('CPF inválido.'); return }
    if (!novoNome.trim()) { setErro('Nome é obrigatório.'); return }

    const { error } = await supabase.from('perfis').insert({
      cpf,
      nome: novoNome.trim(),
      nickname: novoNome.trim().split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100),
    })

    if (error) {
      setErro(error.message.includes('duplicate') ? 'CPF já cadastrado.' : error.message)
    } else {
      setSucesso('Usuário cadastrado!')
      setNovoCpf(''); setNovoNome('')
      carregarUsuarios()
      setTimeout(() => setSucesso(''), 3000)
    }
  }

  async function toggleAtivo(usuario) {
    await supabase.from('perfis').update({ ativo: !usuario.ativo }).eq('id', usuario.id)
    carregarUsuarios()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={cadastrarUsuario} className="card">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Plus size={16} /> Cadastrar Participante
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={novoCpf}
            onChange={(e) => setNovoCpf(e.target.value.length <= 14 ? formatarCPF(limparCPF(e.target.value)) : novoCpf)}
            placeholder="CPF"
            className="input-field"
            inputMode="numeric"
          />
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome completo"
            className="input-field"
          />
          <button type="submit" className="btn-primary">Cadastrar</button>
        </div>
        {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
        {sucesso && <p className="text-green-600 text-sm mt-2">{sucesso}</p>}
      </form>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">{usuarios.length} participantes</h4>
          <button onClick={carregarUsuarios} className="text-gray-500 hover:text-primary">
            <RefreshCw size={16} />
          </button>
        </div>

        {carregando ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="py-2">Nome</th>
                  <th className="py-2">Nickname</th>
                  <th className="py-2">CR</th>
                  <th className="py-2 text-center">Ativo</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-2">{u.nome}</td>
                    <td className="py-2 text-gray-500">{u.nickname || '—'}</td>
                    <td className="py-2 text-gray-500">{u.setor_cr || '—'}</td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => toggleAtivo(u)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.ativo ? 'Sim' : 'Não'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function AbaConvites() {
  const { perfil } = useAuth()
  const [convites, setConvites] = useState([])
  const [copiado, setCopiado] = useState(null)

  useEffect(() => { carregarConvites() }, [])

  async function carregarConvites() {
    const { data } = await supabase.from('convites').select('*').order('criado_em', { ascending: false })
    setConvites(data || [])
  }

  async function gerarConvite() {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    await supabase.from('convites').insert({
      token,
      criado_por: perfil.id,
      expira_em: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    carregarConvites()
  }

  function copiarLink(token) {
    const url = `${window.location.origin}/convite?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiado(token)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="space-y-4">
      <button onClick={gerarConvite} className="btn-primary flex items-center gap-2">
        <Plus size={16} /> Gerar Novo Convite
      </button>

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
            <button
              onClick={() => copiarLink(c.token)}
              disabled={!!c.usado_em}
              className={`p-2 rounded-lg transition-colors ${
                c.usado_em ? 'text-gray-300' : 'text-primary hover:bg-primary/10'
              }`}
            >
              {copiado === c.token ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        ))}
        {convites.length === 0 && (
          <p className="text-center text-gray-500 py-4">Nenhum convite gerado.</p>
        )}
      </div>
    </div>
  )
}

function AbaPlacar() {
  const [partidas, setPartidas] = useState([])
  const [selecoes, setSelecoes] = useState({})
  const [editando, setEditando] = useState(null)
  const [placarCasa, setPlacarCasa] = useState('')
  const [placarFora, setPlacarFora] = useState('')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const [pRes, sRes] = await Promise.all([
      supabase.from('partidas').select('*').order('data_hora'),
      supabase.from('selecoes').select('*'),
    ])
    setPartidas(pRes.data || [])
    const map = {}
    sRes.data?.forEach(s => { map[s.id] = s })
    setSelecoes(map)
  }

  async function salvarPlacar(partida) {
    const pc = parseInt(placarCasa)
    const pf = parseInt(placarFora)
    if (isNaN(pc) || isNaN(pf)) return

    await supabase.from('partidas').update({
      placar_casa: pc,
      placar_fora: pf,
      status: 'encerrado',
      atualizado_em: new Date().toISOString(),
    }).eq('id', partida.id)

    const { data: palpites } = await supabase.from('palpites').select('*').eq('partida_id', partida.id)

    if (palpites) {
      for (const p of palpites) {
        const pontos = calcularPontos(pc, pf, p.placar_casa, p.placar_fora)
        await supabase.from('palpites').update({ pontos }).eq('id', p.id)
      }
    }

    setEditando(null)
    carregarDados()
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Override de Placar</h4>
      <div className="space-y-2">
        {partidas.slice(0, 20).map(p => (
          <div key={p.id} className="card flex items-center justify-between py-3">
            <div className="text-sm">
              <span className="font-semibold">{selecoes[p.selecao_casa_id]?.codigo_fifa || '?'}</span>
              {' '}
              {p.status === 'encerrado' ? `${p.placar_casa} × ${p.placar_fora}` : 'vs'}
              {' '}
              <span className="font-semibold">{selecoes[p.selecao_fora_id]?.codigo_fifa || '?'}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                p.status === 'encerrado' ? 'bg-gray-100 text-gray-600' :
                p.status === 'ao_vivo' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {p.status}
              </span>
            </div>
            {editando === p.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" value={placarCasa}
                  onChange={e => setPlacarCasa(e.target.value)}
                  className="w-12 h-8 text-center text-sm rounded border"
                />
                <span>×</span>
                <input
                  type="number" min="0" value={placarFora}
                  onChange={e => setPlacarFora(e.target.value)}
                  className="w-12 h-8 text-center text-sm rounded border"
                />
                <button onClick={() => salvarPlacar(p)} className="text-green-600 text-sm font-semibold">Salvar</button>
                <button onClick={() => setEditando(null)} className="text-gray-400 text-sm">×</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditando(p.id)
                  setPlacarCasa(p.placar_casa ?? '')
                  setPlacarFora(p.placar_fora ?? '')
                }}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const ABAS = [
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'convites', label: 'Convites', icon: Link2 },
  { id: 'placar', label: 'Placar', icon: Trophy },
]

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios')

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-primary" />
          Painel Administrativo
        </h2>

        <div className="flex gap-2 overflow-x-auto">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                abaAtiva === aba.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <aba.icon size={14} />
              {aba.label}
            </button>
          ))}
        </div>

        {abaAtiva === 'usuarios' && <AbaUsuarios />}
        {abaAtiva === 'convites' && <AbaConvites />}
        {abaAtiva === 'placar' && <AbaPlacar />}
      </div>
    </Layout>
  )
}
