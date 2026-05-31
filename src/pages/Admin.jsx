import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { validarCPF, limparCPF, formatarCPF } from '../lib/cpf'
import { formatarMoeda } from '../lib/formatters'
import { calcularPontos } from '../lib/pontuacao'
import {
  Users, Link2, Trophy, Settings, Plus, Copy, Check,
  RefreshCw, DollarSign, BarChart3, FileText, Database, Download,
} from 'lucide-react'
import Layout from '../components/Layout'

function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novoCpf, setNovoCpf] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [lote, setLote] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [modoLote, setModoLote] = useState(false)

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

  async function cadastrarLote() {
    setErro(''); setSucesso('')
    const linhas = lote.split('\n').filter(l => l.trim())
    let ok = 0, erros = 0

    for (const linha of linhas) {
      const partes = linha.split(/[;,\t]/).map(p => p.trim())
      if (partes.length < 2) { erros++; continue }
      const cpf = limparCPF(partes[0])
      const nome = partes[1]
      if (!validarCPF(cpf) || !nome) { erros++; continue }

      const { error } = await supabase.from('perfis').insert({
        cpf,
        nome,
        nickname: nome.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100),
      })
      if (error) erros++
      else ok++
    }

    setSucesso(`${ok} cadastrados, ${erros} erros.`)
    setLote('')
    carregarUsuarios()
  }

  async function toggleAtivo(usuario) {
    await supabase.from('perfis').update({ ativo: !usuario.ativo }).eq('id', usuario.id)
    carregarUsuarios()
  }

  async function toggleAdmin(usuario) {
    await supabase.from('perfis').update({ is_admin: !usuario.is_admin }).eq('id', usuario.id)
    carregarUsuarios()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button onClick={() => setModoLote(false)} className={`text-sm px-3 py-1 rounded-lg ${!modoLote ? 'bg-primary text-white' : 'bg-gray-200'}`}>Individual</button>
        <button onClick={() => setModoLote(true)} className={`text-sm px-3 py-1 rounded-lg ${modoLote ? 'bg-primary text-white' : 'bg-gray-200'}`}>Em lote</button>
      </div>

      {modoLote ? (
        <div className="card space-y-3">
          <h4 className="font-semibold">Cadastro em lote</h4>
          <p className="text-xs text-gray-500">Uma pessoa por linha: CPF;Nome completo</p>
          <textarea
            value={lote}
            onChange={e => setLote(e.target.value)}
            placeholder="12345678901;João da Silva&#10;98765432100;Maria Santos"
            className="input-field h-32 font-mono text-sm"
          />
          <button onClick={cadastrarLote} className="btn-primary">Cadastrar Todos</button>
          {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}
        </div>
      ) : (
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
      )}

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
                  <th className="py-2 text-center">Ativo</th>
                  <th className="py-2 text-center">Admin</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-2">{u.nome}</td>
                    <td className="py-2 text-gray-500">{u.nickname || '—'}</td>
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
                    <td className="py-2 text-center">
                      <button
                        onClick={() => toggleAdmin(u)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.is_admin ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.is_admin ? 'Sim' : 'Não'}
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
  const [qtd, setQtd] = useState(1)

  useEffect(() => { carregarConvites() }, [])

  async function carregarConvites() {
    const { data } = await supabase.from('convites').select('*').order('criado_em', { ascending: false })
    setConvites(data || [])
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
    await supabase.from('convites').insert(novos)
    carregarConvites()
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
        <input
          type="number" min="1" max="50" value={qtd}
          onChange={e => setQtd(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 input-field text-center"
        />
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
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [sincronizando, setSincronizando] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

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

  async function sincronizarResultados() {
    setSincronizando(true)
    setSyncResult(null)
    try {
      const { data, error } = await supabase.functions.invoke('sincronizar-resultados')
      if (error) throw error
      setSyncResult({ ok: true, ...data })
      carregarDados()
    } catch (err) {
      setSyncResult({ ok: false, error: err.message || 'Erro ao sincronizar' })
    } finally {
      setSincronizando(false)
      setTimeout(() => setSyncResult(null), 8000)
    }
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

    // Snapshot antifraude
    if (palpites) {
      await supabase.from('snapshots_palpites').insert({
        partida_id: partida.id,
        conteudo: palpites,
      })
    }

    setEditando(null)
    carregarDados()
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
        <button
          onClick={sincronizarResultados}
          disabled={sincronizando}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {syncResult && (
        <div className={`card text-sm ${syncResult.ok ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
          {syncResult.ok ? (
            <p className="text-green-700 dark:text-green-300">
              Sincronizado! {syncResult.totalEventos} eventos processados, {syncResult.atualizados} atualizados, {syncResult.pontosRecalculados} pontos recalculados.
            </p>
          ) : (
            <p className="text-red-700 dark:text-red-300">Erro: {syncResult.error}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {['todos', 'agendado', 'ao_vivo', 'encerrado'].map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filtroStatus === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {s === 'todos' ? 'Todos' : s === 'agendado' ? 'Agendado' : s === 'ao_vivo' ? 'Ao Vivo' : 'Encerrado'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtradas.map(p => (
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

function AbaFinanceiro() {
  const [boloes, setBoloes] = useState([])
  const [participantes, setParticipantes] = useState([])
  const [bolaoSelecionado, setBolaoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    setCarregando(true)
    const { data } = await supabase.from('boloes').select('*')
    setBoloes(data || [])
    if (data?.length) {
      setBolaoSelecionado(data[0].id)
      carregarParticipantes(data[0].id)
    }
    setCarregando(false)
  }

  async function carregarParticipantes(bolaoId) {
    const { data } = await supabase
      .from('bolao_participantes')
      .select('*, perfis(nome, nickname, cpf)')
      .eq('bolao_id', bolaoId)
    setParticipantes(data || [])
  }

  async function togglePago(bp) {
    const agora = new Date().toISOString()
    await supabase.from('bolao_participantes').update({
      pago: !bp.pago,
      data_pagamento: !bp.pago ? agora : null,
    }).eq('bolao_id', bp.bolao_id).eq('usuario_id', bp.usuario_id)

    carregarParticipantes(bp.bolao_id)
    recalcularArrecadado(bp.bolao_id)
  }

  async function atualizarValorPago(bp, valor) {
    await supabase.from('bolao_participantes').update({
      valor_pago: parseFloat(valor) || 0,
    }).eq('bolao_id', bp.bolao_id).eq('usuario_id', bp.usuario_id)

    carregarParticipantes(bp.bolao_id)
    recalcularArrecadado(bp.bolao_id)
  }

  async function recalcularArrecadado(bolaoId) {
    const { data } = await supabase
      .from('bolao_participantes')
      .select('valor_pago')
      .eq('bolao_id', bolaoId)
      .eq('pago', true)

    const total = (data || []).reduce((acc, p) => acc + (p.valor_pago || 0), 0)
    await supabase.from('boloes').update({ valor_arrecadado: total }).eq('id', bolaoId)
  }

  const bolaoAtual = boloes.find(b => b.id === bolaoSelecionado)
  const pagos = participantes.filter(p => p.pago).length
  const totalArrecadado = participantes.filter(p => p.pago).reduce((acc, p) => acc + (p.valor_pago || 0), 0)

  return (
    <div className="space-y-4">
      {boloes.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum bolão criado.</p>
      ) : (
        <>
          <select
            value={bolaoSelecionado || ''}
            onChange={e => { setBolaoSelecionado(e.target.value); carregarParticipantes(e.target.value) }}
            className="input-field"
          >
            {boloes.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-bold">{participantes.length}</p>
              <p className="text-xs text-gray-500">Participantes</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">{pagos}</p>
              <p className="text-xs text-gray-500">Pagos</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary">{formatarMoeda(totalArrecadado)}</p>
              <p className="text-xs text-gray-500">Arrecadado</p>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="py-2">Nome</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2 text-center">Pago</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {participantes.map(bp => (
                  <tr key={bp.usuario_id} className="border-b border-gray-100">
                    <td className="py-2">{bp.perfis?.nickname || bp.perfis?.nome || '—'}</td>
                    <td className="py-2">
                      <input
                        type="number" step="0.01" min="0"
                        defaultValue={bp.valor_pago || ''}
                        onBlur={e => atualizarValorPago(bp, e.target.value)}
                        className="w-24 text-sm px-2 py-1 rounded border"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={() => togglePago(bp)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bp.pago ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {bp.pago ? 'Sim' : 'Não'}
                      </button>
                    </td>
                    <td className="py-2 text-xs text-gray-400">
                      {bp.data_pagamento ? new Date(bp.data_pagamento).toLocaleDateString('pt-BR') : '—'}
                    </td>
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

function AbaDashboard() {
  const [stats, setStats] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => { carregarStats() }, [])

  async function carregarStats() {
    setCarregando(true)
    const [perfisRes, palpitesRes, partidasRes, bpRes] = await Promise.all([
      supabase.from('perfis').select('id, ativo'),
      supabase.from('palpites').select('usuario_id, partida_id'),
      supabase.from('partidas').select('id, status'),
      supabase.from('bolao_participantes').select('pago'),
    ])

    const perfis = perfisRes.data || []
    const palpites = palpitesRes.data || []
    const partidas = partidasRes.data || []
    const bp = bpRes.data || []

    const ativos = perfis.filter(p => p.ativo).length
    const encerrados = partidas.filter(p => p.status === 'encerrado').length
    const pagos = bp.filter(p => p.pago).length

    const palpitanteUnicos = new Set(palpites.map(p => p.usuario_id)).size
    const palpitesPorJogo = {}
    palpites.forEach(p => {
      palpitesPorJogo[p.partida_id] = (palpitesPorJogo[p.partida_id] || 0) + 1
    })

    setStats({
      totalPerfis: perfis.length,
      ativos,
      encerrados,
      totalPartidas: partidas.length,
      pagos,
      totalBP: bp.length,
      palpitanteUnicos,
      mediaPalpitesPorJogo: encerrados > 0
        ? Math.round(Object.values(palpitesPorJogo).reduce((a, b) => a + b, 0) / Math.max(Object.keys(palpitesPorJogo).length, 1))
        : 0,
    })
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
        <div className="card text-center">
          <p className="text-2xl font-bold">{stats.totalPerfis}</p>
          <p className="text-xs text-gray-500">Cadastrados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
          <p className="text-xs text-gray-500">Ativos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.palpitanteUnicos}</p>
          <p className="text-xs text-gray-500">Palpitando</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{stats.pagos}/{stats.totalBP}</p>
          <p className="text-xs text-gray-500">Pagamentos</p>
        </div>
      </div>

      <div className="card">
        <h4 className="font-semibold mb-3">Progresso do Torneio</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all"
              style={{ width: `${(stats.encerrados / Math.max(stats.totalPartidas, 1)) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{stats.encerrados}/{stats.totalPartidas}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">jogos encerrados</p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500">
          Média de palpites por jogo: <strong>{stats.mediaPalpitesPorJogo}</strong>
        </p>
      </div>
    </div>
  )
}

function AbaPremiacao() {
  const [boloes, setBoloes] = useState([])
  const [bolaoId, setBolaoId] = useState(null)
  const [regras, setRegras] = useState([])
  const [novaPos, setNovaPos] = useState('')
  const [novoPerc, setNovoPerc] = useState('')

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    const { data } = await supabase.from('boloes').select('*')
    setBoloes(data || [])
    if (data?.length) {
      setBolaoId(data[0].id)
      carregarRegras(data[0].id)
    }
  }

  async function carregarRegras(bid) {
    const { data } = await supabase.from('premiacao_regras').select('*').eq('bolao_id', bid).order('posicao')
    setRegras(data || [])
  }

  async function adicionarRegra() {
    const pos = parseInt(novaPos)
    const perc = parseFloat(novoPerc)
    if (!bolaoId || isNaN(pos) || isNaN(perc)) return

    await supabase.from('premiacao_regras').upsert({
      bolao_id: bolaoId,
      posicao: pos,
      percentual: perc,
    })
    setNovaPos(''); setNovoPerc('')
    carregarRegras(bolaoId)
  }

  async function removerRegra(posicao) {
    await supabase.from('premiacao_regras').delete().eq('bolao_id', bolaoId).eq('posicao', posicao)
    carregarRegras(bolaoId)
  }

  const totalPerc = regras.reduce((acc, r) => acc + (r.percentual || 0), 0)
  const bolao = boloes.find(b => b.id === bolaoId)

  return (
    <div className="space-y-4">
      {boloes.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum bolão criado.</p>
      ) : (
        <>
          <select
            value={bolaoId || ''}
            onChange={e => { setBolaoId(e.target.value); carregarRegras(e.target.value) }}
            className="input-field"
          >
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
              <input
                type="number" min="1" placeholder="Posição"
                value={novaPos} onChange={e => setNovaPos(e.target.value)}
                className="w-24 input-field text-sm"
              />
              <input
                type="number" step="0.01" min="0" max="100" placeholder="%"
                value={novoPerc} onChange={e => setNovoPerc(e.target.value)}
                className="w-24 input-field text-sm"
              />
              <button onClick={adicionarRegra} className="btn-primary text-sm px-4">Adicionar</button>
            </div>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-xs text-yellow-800">
              O sistema calcula e exibe os valores estimados. A entrega dos prêmios é responsabilidade do organizador.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function AbaBoloes() {
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
    const { data } = await supabase
      .from('boloes')
      .select('*, bolao_participantes(count)')
      .order('criado_em', { ascending: false })
    setBoloes(data || [])
    setCarregando(false)
  }

  async function criarBolao(e) {
    e.preventDefault()
    setErro(''); setSucesso('')

    if (!nome.trim()) { setErro('Nome é obrigatório.'); return }

    const codigo = nome.trim()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 12) + Math.floor(Math.random() * 1000)

    const { error } = await supabase.from('boloes').insert({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      codigo_convite: codigo,
      organizador_id: perfil.id,
      valor_inscricao: parseFloat(valorInscricao) || 0,
      publico,
    })

    if (error) {
      setErro(error.message)
    } else {
      setSucesso('Bolão criado!')
      setNome(''); setDescricao(''); setValorInscricao('')
      carregarBoloes()
      setTimeout(() => setSucesso(''), 3000)
    }
  }

  async function salvarEdicao(bolao) {
    await supabase.from('boloes').update({
      nome: bolao.nome,
      descricao: bolao.descricao,
      valor_inscricao: bolao.valor_inscricao,
      publico: bolao.publico,
    }).eq('id', bolao.id)
    setEditando(null)
    carregarBoloes()
  }

  function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={criarBolao} className="card space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Plus size={16} /> Criar Bolão
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome do bolão"
            className="input-field"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={valorInscricao}
            onChange={e => setValorInscricao(e.target.value)}
            placeholder="Valor inscrição (R$)"
            className="input-field"
          />
        </div>
        <input
          type="text"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Descrição (opcional)"
          className="input-field"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publico}
              onChange={e => setPublico(e.target.checked)}
              className="rounded"
            />
            Bolão público (visível para todos)
          </label>
          <button type="submit" className="btn-primary">Criar</button>
        </div>
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}
      </form>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boloes.length === 0 ? (
        <div className="card text-center text-gray-500 py-6">
          Nenhum bolão criado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {boloes.map(b => {
            const numPart = b.bolao_participantes?.[0]?.count || 0

            if (editando === b.id) {
              return (
                <div key={b.id} className="card space-y-3">
                  <input
                    type="text"
                    defaultValue={b.nome}
                    onChange={e => b.nome = e.target.value}
                    className="input-field"
                  />
                  <input
                    type="text"
                    defaultValue={b.descricao || ''}
                    onChange={e => b.descricao = e.target.value}
                    className="input-field"
                    placeholder="Descrição"
                  />
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={b.valor_inscricao}
                    onChange={e => b.valor_inscricao = parseFloat(e.target.value) || 0}
                    className="input-field"
                    placeholder="Valor inscrição"
                  />
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
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {numPart} participantes
                      </span>
                      <span>Inscrição: {formatarMoeda(b.valor_inscricao || 0)}</span>
                      <span>{b.publico ? 'Público' : 'Privado'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditando(b.id)}
                    className="text-primary text-sm font-semibold hover:underline"
                  >
                    Editar
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A3942] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Código de entrada</p>
                    <p className="font-mono text-sm font-bold">{b.codigo_convite}</p>
                  </div>
                  <button
                    onClick={() => copiarCodigo(b.codigo_convite)}
                    className="flex items-center gap-1 text-primary text-sm hover:underline"
                  >
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

function AbaBackups() {
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
      supabase.from('backups_rodada').select('*').order('criado_em', { ascending: false }),
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

    const [partidasRes, palpitesRes, perfisRes] = await Promise.all([
      supabase.from('partidas').select('*').eq('rodada', rodadaSelecionada),
      supabase.from('palpites').select('*, perfis(nickname)'),
      supabase.from('perfis').select('id, nickname, ativo').eq('ativo', true),
    ])

    const partidas = partidasRes.data || []
    const todosPalpites = palpitesRes.data || []
    const perfis = perfisRes.data || []

    const partidaIds = new Set(partidas.map(p => p.id))
    const palpitesRodada = todosPalpites.filter(p => partidaIds.has(p.partida_id))

    const rankingMap = {}
    todosPalpites.forEach(p => {
      if (!rankingMap[p.usuario_id]) rankingMap[p.usuario_id] = { pontos: 0, cravadas: 0, jogos: 0 }
      rankingMap[p.usuario_id].pontos += p.pontos || 0
      rankingMap[p.usuario_id].jogos++
      if (p.pontos === 10) rankingMap[p.usuario_id].cravadas++
    })

    const ranking = perfis.map(p => ({
      id: p.id,
      nickname: p.nickname,
      ...(rankingMap[p.id] || { pontos: 0, cravadas: 0, jogos: 0 }),
    })).sort((a, b) => b.pontos - a.pontos || b.cravadas - a.cravadas)

    const { error } = await supabase.from('backups_rodada').insert({
      rodada: rodadaSelecionada,
      tipo: 'manual',
      partidas,
      palpites: palpitesRodada,
      ranking,
      total_partidas: partidas.length,
      total_palpites: palpitesRodada.length,
      total_jogadores: perfis.length,
      criado_por: perfil.id,
    })

    if (error) {
      setResultado({ ok: false, error: error.message })
    } else {
      setResultado({
        ok: true,
        msg: `Backup da "${rodadaSelecionada}" criado: ${partidas.length} partidas, ${palpitesRodada.length} palpites, ${ranking.length} jogadores.`,
      })
      carregarDados()
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
        <h4 className="font-semibold flex items-center gap-2 mb-3">
          <Database size={16} />
          Criar Backup de Rodada
        </h4>
        <p className="text-xs text-gray-500 dark:text-[#8696A0] mb-3">
          Salva um snapshot completo: partidas, palpites e ranking no momento do backup.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={rodadaSelecionada}
            onChange={e => setRodadaSelecionada(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3B4A54] bg-white dark:bg-[#2A3942] text-sm"
          >
            {rodadas.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={criarBackup}
            disabled={criando || !rodadaSelecionada}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {criando ? 'Criando...' : 'Criar Backup'}
          </button>
        </div>

        {resultado && (
          <div className={`mt-3 text-sm rounded-lg p-3 ${
            resultado.ok
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
          }`}>
            {resultado.ok ? resultado.msg : `Erro: ${resultado.error}`}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-sm">Backups anteriores</h4>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : backups.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-[#8696A0] py-6 text-sm">Nenhum backup criado ainda.</p>
      ) : (
        <div className="space-y-2">
          {backups.map(b => (
            <div key={b.id} className="card flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-sm">{b.rodada}</p>
                <p className="text-xs text-gray-500 dark:text-[#8696A0]">
                  {new Date(b.criado_em).toLocaleString('pt-BR')} · {b.tipo} · {b.total_partidas} partidas · {b.total_palpites} palpites · {b.total_jogadores} jogadores
                </p>
              </div>
              <button
                onClick={() => exportarJson(b)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A3942] text-gray-500"
                title="Exportar JSON"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ABAS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'boloes', label: 'Bolões', icon: Users },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'convites', label: 'Convites', icon: Link2 },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'premiacao', label: 'Premiação', icon: Trophy },
  { id: 'placar', label: 'Placar', icon: FileText },
  { id: 'backups', label: 'Backups', icon: Database },
]

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-primary" />
          Painel Administrativo
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors chip ${
                abaAtiva === aba.id ? 'chip-active' : 'chip-inactive'
              }`}
            >
              <aba.icon size={14} />
              {aba.label}
            </button>
          ))}
        </div>

        {abaAtiva === 'dashboard' && <AbaDashboard />}
        {abaAtiva === 'boloes' && <AbaBoloes />}
        {abaAtiva === 'usuarios' && <AbaUsuarios />}
        {abaAtiva === 'convites' && <AbaConvites />}
        {abaAtiva === 'financeiro' && <AbaFinanceiro />}
        {abaAtiva === 'premiacao' && <AbaPremiacao />}
        {abaAtiva === 'placar' && <AbaPlacar />}
        {abaAtiva === 'backups' && <AbaBackups />}
      </div>
    </Layout>
  )
}
