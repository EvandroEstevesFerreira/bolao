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
    <div className="min-h-screen bg-[#111B21] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[#075E54]/30" />
      <div className="login-orb w-72 h-72 bg-[#25D366] top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }} />
      <div className="login-orb w-96 h-96 bg-[#075E54] bottom-[-15%] right-[-15%]" style={{ animationDelay: '3s' }} />
      <div className="login-orb w-48 h-48 bg-[#00A884] top-[40%] right-[10%]" style={{ animationDelay: '5s' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <img
            src="/favicon.svg"
            alt="Bolão Copa 2026"
            className="animate-float-in w-20 h-20 mx-auto mb-4 rounded-2xl"
          />
          <h1 className="animate-fade-up text-2xl font-bold text-white tracking-tight" style={{ animationDelay: '0.2s' }}>
            Bolão Copa 2026
          </h1>
          <p className="animate-fade-up text-[#8696A0] mt-1 text-sm" style={{ animationDelay: '0.35s' }}>
            Faça seus palpites e dispute com seus amigos!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="animate-slide-up space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942]" style={{ animationDelay: '0.4s' }}>
          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Seu PIN de 4 dígitos"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              maxLength={6}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          {erro && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary btn-glow w-full"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="animate-fade-in text-center text-[#8696A0] text-sm mt-4" style={{ animationDelay: '0.7s' }}>
          Recebeu um link de convite?{' '}
          <Link to="/convite" className="text-primary hover:underline font-medium">
            Resgate aqui
          </Link>
        </p>

        <p className="animate-fade-in text-center text-[#8696A0]/60 text-[11px] mt-6 px-4" style={{ animationDelay: '0.85s' }}>
          Este sistema é ferramenta de acompanhamento e cálculo.
          A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
        </p>
      </div>
    </div>
  )
}
