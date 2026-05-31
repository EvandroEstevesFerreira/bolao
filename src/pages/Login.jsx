import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validarCPF, formatarCPF, limparCPF } from '../lib/cpf'
import { MessageCircle, Mail, KeyRound } from 'lucide-react'

const ABAS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'cpf', label: 'CPF', icon: KeyRound },
]

export default function Login() {
  const [aba, setAba] = useState('whatsapp')
  const { login, loginEmail, enviarOtpWhatsApp, verificarOtpWhatsApp } = useAuth()
  const navigate = useNavigate()

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

        {/* Abas de login */}
        <div className="animate-slide-up flex bg-[#1A2329] rounded-xl p-1 mb-4 border border-[#2A3942]" style={{ animationDelay: '0.4s' }}>
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                aba === id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-[#8696A0] hover:text-white'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {aba === 'whatsapp' && <LoginWhatsApp navigate={navigate} />}
        {aba === 'email' && <LoginEmailMagicLink navigate={navigate} />}
        {aba === 'cpf' && <LoginCPF navigate={navigate} />}

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

function LoginWhatsApp({ navigate }) {
  const [telefone, setTelefone] = useState('')
  const [codigo, setCodigo] = useState('')
  const [etapa, setEtapa] = useState('telefone')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { enviarOtpWhatsApp, verificarOtpWhatsApp } = useAuth()

  function formatarTelefone(value) {
    const nums = value.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return nums
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }

  async function handleEnviar(e) {
    e.preventDefault()
    setErro('')
    const tel = telefone.replace(/\D/g, '')
    if (tel.length < 10) {
      setErro('Número inválido.')
      return
    }
    setCarregando(true)
    try {
      await enviarOtpWhatsApp(tel)
      setEtapa('codigo')
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleVerificar(e) {
    e.preventDefault()
    setErro('')
    if (codigo.length !== 6) {
      setErro('Código deve ter 6 dígitos.')
      return
    }
    setCarregando(true)
    try {
      const result = await verificarOtpWhatsApp(telefone.replace(/\D/g, ''), codigo)
      if (result.needsProfile) {
        setErro('Número não cadastrado. Peça um convite ao organizador.')
      } else if (result.perfil) {
        navigate('/')
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form
      onSubmit={etapa === 'telefone' ? handleEnviar : handleVerificar}
      className="animate-slide-up space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942]"
      style={{ animationDelay: '0.5s' }}
    >
      {etapa === 'telefone' ? (
        <>
          <div className="text-center mb-2">
            <MessageCircle size={32} className="text-[#25D366] mx-auto mb-2" />
            <p className="text-sm text-[#D1D7DB]">Receba um código no seu WhatsApp</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">WhatsApp</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-2">
            <p className="text-sm text-[#D1D7DB]">
              Código enviado para <span className="text-primary font-medium">{telefone}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">Código de 6 dígitos</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => { setEtapa('telefone'); setCodigo(''); setErro('') }}
            className="text-[#8696A0] text-sm hover:text-white transition-colors"
          >
            Trocar número
          </button>
        </>
      )}

      {erro && <p className="text-red-400 text-sm text-center animate-fade-in">{erro}</p>}

      <button type="submit" disabled={carregando} className="btn-primary btn-glow w-full">
        {carregando ? 'Aguarde...' : etapa === 'telefone' ? 'Enviar Código' : 'Verificar'}
      </button>
    </form>
  )
}

function LoginEmailMagicLink({ navigate }) {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { loginEmail } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!email || !email.includes('@')) {
      setErro('E-mail inválido.')
      return
    }
    setCarregando(true)
    try {
      await loginEmail(email)
      setEnviado(true)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <div className="animate-slide-up space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942] text-center" style={{ animationDelay: '0.5s' }}>
        <Mail size={40} className="text-primary mx-auto" />
        <h3 className="text-white font-bold text-lg">Verifique seu e-mail</h3>
        <p className="text-[#8696A0] text-sm">
          Enviamos um link mágico para <span className="text-primary font-medium">{email}</span>
        </p>
        <p className="text-[#8696A0] text-xs">Clique no link do e-mail para entrar automaticamente.</p>
        <button
          onClick={() => { setEnviado(false); setErro('') }}
          className="text-primary text-sm hover:underline"
        >
          Usar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-up space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942]"
      style={{ animationDelay: '0.5s' }}
    >
      <div className="text-center mb-2">
        <Mail size={32} className="text-primary mx-auto mb-2" />
        <p className="text-sm text-[#D1D7DB]">Receba um link de acesso no seu e-mail</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          autoComplete="email"
        />
      </div>

      {erro && <p className="text-red-400 text-sm text-center animate-fade-in">{erro}</p>}

      <button type="submit" disabled={carregando} className="btn-primary btn-glow w-full">
        {carregando ? 'Enviando...' : 'Enviar Link Mágico'}
      </button>
    </form>
  )
}

function LoginCPF({ navigate }) {
  const [cpf, setCpf] = useState('')
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { login } = useAuth()

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
    <form
      onSubmit={handleSubmit}
      className="animate-slide-up space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942]"
      style={{ animationDelay: '0.5s' }}
    >
      <div className="text-center mb-2">
        <KeyRound size={32} className="text-[#F59E0B] mx-auto mb-2" />
        <p className="text-sm text-[#D1D7DB]">Acesso com CPF e PIN</p>
      </div>
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

      {erro && <p className="text-red-400 text-sm text-center animate-fade-in">{erro}</p>}

      <button type="submit" disabled={carregando} className="btn-primary btn-glow w-full">
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
