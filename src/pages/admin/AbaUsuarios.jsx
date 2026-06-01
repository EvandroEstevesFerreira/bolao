import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../lib/adminApi'
import { validarCPF, limparCPF, formatarCPF } from '../../lib/cpf'
import { Plus, RefreshCw } from 'lucide-react'

export default function AbaUsuarios() {
  const { perfil } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [novoCpf, setNovoCpf] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoTelefone, setNovoTelefone] = useState('')
  const [lote, setLote] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [modoLote, setModoLote] = useState(false)
  const [busca, setBusca] = useState('')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => { carregarUsuarios() }, [])

  async function carregarUsuarios() {
    setCarregando(true)
    try {
      const { data } = await adminApi('listar_usuarios', perfil.id)
      setUsuarios(data || [])
    } catch { /* ignore */ }
    setCarregando(false)
  }

  async function cadastrarUsuario(e) {
    e.preventDefault()
    setErro(''); setSucesso('')
    if (!novoNome.trim()) { setErro('Nome é obrigatório.'); return }
    const cpf = limparCPF(novoCpf)
    if (cpf && !validarCPF(cpf)) { setErro('CPF inválido.'); return }

    const dados = {
      nome: novoNome.trim(),
      nickname: novoNome.trim().split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100),
    }
    if (cpf) dados.cpf = cpf
    if (novoEmail.trim()) dados.email = novoEmail.trim()
    if (novoTelefone.trim()) dados.telefone = novoTelefone.replace(/\D/g, '')

    try {
      await adminApi('cadastrar_usuario', perfil.id, dados)
      setSucesso('Usuário cadastrado!')
      setNovoCpf(''); setNovoNome(''); setNovoEmail(''); setNovoTelefone('')
      carregarUsuarios()
      setTimeout(() => setSucesso(''), 3000)
    } catch (err) {
      setErro(err.message.includes('duplicate') ? 'CPF, e-mail ou telefone já cadastrado.' : err.message)
    }
  }

  async function cadastrarLote() {
    setErro(''); setSucesso('')
    const linhas = lote.split('\n').filter(l => l.trim())
    const usuarios = []

    for (const linha of linhas) {
      const partes = linha.split(/[;,\t]/).map(p => p.trim())
      if (partes.length < 1 || !partes[0]) continue

      const primeiroCampo = partes[0]
      const ehCpf = /^\d{11,14}$/.test(primeiroCampo.replace(/\D/g, '')) && validarCPF(limparCPF(primeiroCampo))

      let cpf = null, nome = null, emailIdx = -1, telIdx = -1
      if (ehCpf) {
        cpf = limparCPF(primeiroCampo)
        nome = partes[1] || null
        emailIdx = 2; telIdx = 3
      } else {
        nome = primeiroCampo
        emailIdx = 1; telIdx = 2
      }

      if (!nome) continue

      const dados = {
        nome,
        nickname: nome.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100),
      }
      if (cpf) dados.cpf = cpf
      if (partes[emailIdx] && partes[emailIdx].includes('@')) dados.email = partes[emailIdx]
      if (partes[telIdx]) dados.telefone = partes[telIdx].replace(/\D/g, '')

      usuarios.push(dados)
    }

    try {
      const result = await adminApi('cadastrar_lote', perfil.id, { usuarios })
      setSucesso(`${result.ok} cadastrados, ${result.erros} erros.`)
      setLote('')
      carregarUsuarios()
    } catch (err) {
      setErro(err.message)
    }
  }

  async function toggleAtivo(usuario) {
    try {
      await adminApi('toggle_ativo', perfil.id, { usuario_id: usuario.id, ativo: !usuario.ativo })
      carregarUsuarios()
    } catch { /* ignore */ }
  }

  async function toggleAdmin(usuario) {
    try {
      await adminApi('toggle_admin', perfil.id, { usuario_id: usuario.id, is_admin: !usuario.is_admin })
      carregarUsuarios()
    } catch (err) {
      alert(err.message)
    }
  }

  function formatarCpfExibicao(cpf) {
    if (!cpf || cpf.length !== 11) return cpf || '—'
    return `***.***.${cpf.slice(6, 9)}-${cpf.slice(9)}`
  }

  function formatarTelExibicao(tel) {
    if (!tel) return '—'
    if (tel.length === 11) return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`
    if (tel.length === 10) return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`
    return tel
  }

  const usuariosFiltrados = busca.trim()
    ? usuarios.filter(u =>
        (u.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
        (u.nickname || '').toLowerCase().includes(busca.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(busca.toLowerCase()) ||
        (u.cpf || '').includes(busca.replace(/\D/g, ''))
      )
    : usuarios

  const totalAtivos = usuarios.filter(u => u.ativo).length
  const totalComEmail = usuarios.filter(u => u.email).length
  const totalComTelefone = usuarios.filter(u => u.telefone).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-primary">{usuarios.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-[#8696A0] uppercase tracking-wider">Total</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-green-500">{totalAtivos}</p>
          <p className="text-[10px] text-gray-500 dark:text-[#8696A0] uppercase tracking-wider">Ativos</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-blue-500">{totalComEmail}</p>
          <p className="text-[10px] text-gray-500 dark:text-[#8696A0] uppercase tracking-wider">Com E-mail</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-[#25D366]">{totalComTelefone}</p>
          <p className="text-[10px] text-gray-500 dark:text-[#8696A0] uppercase tracking-wider">Com WhatsApp</p>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={() => setModoLote(false)} className={`text-sm px-3 py-1 rounded-lg ${!modoLote ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-[#2A3942] dark:text-[#D1D7DB]'}`}>Individual</button>
        <button onClick={() => setModoLote(true)} className={`text-sm px-3 py-1 rounded-lg ${modoLote ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-[#2A3942] dark:text-[#D1D7DB]'}`}>Em lote</button>
      </div>

      {modoLote ? (
        <div className="card space-y-3">
          <h4 className="font-semibold">Cadastro em lote</h4>
          <p className="text-xs text-gray-500 dark:text-[#8696A0]">Uma pessoa por linha: Nome;E-mail;Telefone (ou CPF;Nome;E-mail;Telefone)</p>
          <textarea
            value={lote}
            onChange={e => setLote(e.target.value)}
            placeholder="João da Silva;joao@email.com;11999998888&#10;Maria Santos;maria@email.com&#10;12345678901;Carlos Lima;carlos@email.com"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={novoCpf} onChange={(e) => setNovoCpf(e.target.value.length <= 14 ? formatarCPF(limparCPF(e.target.value)) : novoCpf)} placeholder="CPF (opcional)" className="input-field" inputMode="numeric" />
            <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome completo *" className="input-field" />
            <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} placeholder="E-mail (opcional)" className="input-field" />
            <input type="tel" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} placeholder="Telefone (opcional)" className="input-field" inputMode="tel" />
          </div>
          <div className="mt-3">
            <button type="submit" className="btn-primary">Cadastrar</button>
          </div>
          {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm mt-2">{sucesso}</p>}
        </form>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h4 className="font-semibold">{usuariosFiltrados.length} participantes</h4>
          <div className="flex items-center gap-2">
            <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="input-field !py-1.5 !px-3 text-sm w-40" />
            <button onClick={carregarUsuarios} className="text-gray-500 hover:text-primary"><RefreshCw size={16} /></button>
          </div>
        </div>

        {carregando ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {usuariosFiltrados.map(u => (
              <div key={u.id} className="border border-gray-100 dark:border-[#2A3942] rounded-xl overflow-hidden">
                <div onClick={() => setExpandido(expandido === u.id ? null : u.id)} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2A3942]/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{(u.nickname || u.nome || '??').slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{u.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-[#8696A0] truncate">@{u.nickname || '—'}{u.email && <span className="ml-2">• {u.email}</span>}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-green-500' : 'bg-red-400'}`} />
                    {u.is_admin && <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded text-[10px] font-bold">ADM</span>}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandido === u.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandido === u.id && (
                  <div className="px-3 pb-3 border-t border-gray-100 dark:border-[#2A3942] bg-gray-50/50 dark:bg-[#1A2329]/50">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2.5">
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Nome</dt><dd className="font-medium text-xs">{u.nome}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Nickname</dt><dd className="font-medium text-xs">@{u.nickname || '—'}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">CPF</dt><dd className="font-medium text-xs font-mono">{formatarCpfExibicao(u.cpf)}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">E-mail</dt><dd className="font-medium text-xs truncate">{u.email || '—'}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Telefone</dt><dd className="font-medium text-xs">{formatarTelExibicao(u.telefone)}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Setor/CR</dt><dd className="font-medium text-xs">{u.setor_cr || '—'}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Cadastro</dt><dd className="font-medium text-xs">{u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-BR') : '—'}</dd></div>
                      <div><dt className="text-[10px] text-gray-400 uppercase tracking-wider">Auth</dt><dd className="font-medium text-xs">{u.auth_uid ? <span className="text-green-600">Vinculado</span> : <span className="text-gray-400">Legado</span>}</dd></div>
                    </dl>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toggleAtivo(u)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${u.ativo ? 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100' : 'bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100'}`}>{u.ativo ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => toggleAdmin(u)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${u.is_admin ? 'bg-gray-100 dark:bg-[#2A3942] text-gray-600 dark:text-[#8696A0] hover:bg-gray-200' : 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 hover:bg-teal-100'}`}>{u.is_admin ? 'Remover Admin' : 'Tornar Admin'}</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
