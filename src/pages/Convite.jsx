import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validarCPF, formatarCPF, limparCPF } from '../lib/cpf'

export default function Convite() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [cpf, setCpf] = useState('')
  const [nome, setNome] = useState('')
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { resgatarConvite } = useAuth()
  const navigate = useNavigate()

  function handleCpfChange(e) {
    const raw = limparCPF(e.target.value)
    if (raw.length <= 11) setCpf(raw.length > 3 ? formatarCPF(raw) : raw)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const cpfLimpo = limparCPF(cpf)
    if (!validarCPF(cpfLimpo)) { setErro('CPF inválido.'); return }
    if (!nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (!nickname.trim()) { setErro('Escolha um apelido.'); return }
    if (nickname.trim().length < 3) { setErro('Apelido deve ter pelo menos 3 caracteres.'); return }
    if (!pin || pin.length < 4) { setErro('PIN deve ter pelo menos 4 dígitos.'); return }
    if (pin !== pinConfirm) { setErro('PINs não conferem.'); return }
    if (!token.trim()) { setErro('Token de convite é obrigatório.'); return }

    setCarregando(true)
    try {
      await resgatarConvite(token.trim(), {
        cpf: cpfLimpo,
        nome: nome.trim(),
        nickname: nickname.trim(),
        pin,
        setor_cr: null,
        avatar_url: null,
      })
      navigate('/')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-xl font-bold text-white">Resgate seu Convite</h1>
          <p className="text-gray-400 text-sm mt-1">Preencha seus dados para participar</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {!searchParams.get('token') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código do convite</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o código do convite"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="input-field"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apelido (nickname)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Como você quer aparecer no ranking"
              className="input-field"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4+ dígitos"
                className="input-field"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar PIN</label>
              <input
                type="password"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value)}
                placeholder="Repita"
                className="input-field"
                maxLength={6}
                inputMode="numeric"
              />
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? 'Resgatando...' : 'Resgatar Convite e Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Já tem cadastro?{' '}
          <a href="/login" className="text-primary hover:underline">Faça login</a>
        </p>
      </div>
    </div>
  )
}
