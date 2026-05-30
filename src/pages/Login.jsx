import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validarCPF, formatarCPF, limparCPF } from '../lib/cpf'

export default function Login() {
  const [cpf, setCpf] = useState('')
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleCpfChange(e) {
    const raw = limparCPF(e.target.value)
    if (raw.length <= 11) {
      setCpf(raw.length > 3 ? formatarCPF(raw) : raw)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const cpfLimpo = limparCPF(cpf)
    if (!validarCPF(cpfLimpo)) {
      setErro('CPF inválido.')
      return
    }

    setCarregando(true)
    try {
      await login(cpfLimpo, pin)
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Bolão Copa 2026</h1>
          <p className="text-gray-400 mt-1">Faça seus palpites</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="input-field"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Seu PIN de 4 dígitos"
              className="input-field"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary w-full"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Recebeu um link de convite?{' '}
          <Link to="/convite" className="text-primary hover:underline">
            Resgate aqui
          </Link>
        </p>

        <p className="text-center text-gray-600 text-xs mt-6 px-4">
          Este sistema é ferramenta de acompanhamento e cálculo.
          A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
        </p>
      </div>
    </div>
  )
}
