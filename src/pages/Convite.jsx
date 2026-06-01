import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Convite() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [nome, setNome] = useState('')
  const [nickname, setNickname] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { resgatarConvite } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (!nickname.trim()) { setErro('Escolha um apelido.'); return }
    if (nickname.trim().length < 3) { setErro('Apelido deve ter pelo menos 3 caracteres.'); return }
    if (!token.trim()) { setErro('Token de convite é obrigatório.'); return }

    setCarregando(true)
    try {
      await resgatarConvite(token.trim(), {
        nome: nome.trim(),
        nickname: nickname.trim(),
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
    <div className="min-h-screen bg-[#111B21] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[#075E54]/30" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <img
            src="/favicon.svg"
            alt="Bolão Copa 2026"
            className="w-16 h-16 mx-auto mb-3 rounded-2xl"
          />
          <h1 className="text-xl font-bold text-white">Resgate seu Convite</h1>
          <p className="text-[#8696A0] text-sm mt-1">Preencha seus dados para participar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#202C33] rounded-2xl p-6 border border-[#2A3942]">
          {!searchParams.get('token') && (
            <div>
              <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">Código do convite</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole o código do convite"
                className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">Nome completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#D1D7DB] mb-1.5">Apelido (nickname)</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="Como você quer aparecer no ranking"
              className="w-full px-4 py-3 rounded-xl bg-[#2A3942] border border-[#3B4A54] text-white placeholder-[#8696A0] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              maxLength={20} />
          </div>

          {erro && <p className="text-red-400 text-sm text-center">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? 'Resgatando...' : 'Resgatar Convite e Entrar'}
          </button>
        </form>

        <p className="text-center text-[#8696A0] text-sm mt-4">
          Já tem cadastro?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">Faça login</a>
        </p>
      </div>
    </div>
  )
}
