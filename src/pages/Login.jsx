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
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-indigo-950 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="login-orb w-72 h-72 bg-primary top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }} />
      <div className="login-orb w-96 h-96 bg-purple-500 bottom-[-15%] right-[-15%]" style={{ animationDelay: '3s' }} />
      <div className="login-orb w-48 h-48 bg-cyan-400 top-[40%] right-[10%]" style={{ animationDelay: '5s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img
            src="/favicon.svg"
            alt="Bolão Copa 2026"
            className="animate-float-in w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg shadow-primary/30"
          />
          <h1 className="animate-fade-up text-2xl font-bold text-white" style={{ animationDelay: '0.2s' }}>
            Bolão Copa 2026
          </h1>
          <p className="animate-fade-up text-gray-400 mt-1" style={{ animationDelay: '0.35s' }}>
            Faça seus palpites e dispute com seus amigos!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="animate-slide-up card space-y-4" style={{ animationDelay: '0.4s' }}>
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
            <p className="text-red-500 text-sm text-center animate-fade-in">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary btn-glow w-full"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="animate-fade-in text-center text-gray-500 text-sm mt-4" style={{ animationDelay: '0.7s' }}>
          Recebeu um link de convite?{' '}
          <Link to="/convite" className="text-primary hover:underline">
            Resgate aqui
          </Link>
        </p>

        <p className="animate-fade-in text-center text-gray-600 text-xs mt-6 px-4" style={{ animationDelay: '0.85s' }}>
          Este sistema é ferramenta de acompanhamento e cálculo.
          A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
        </p>
      </div>
    </div>
  )
}
