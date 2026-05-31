import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, MessageCircle, X } from 'lucide-react'

export default function ModalVincular() {
  const { precisaVincular, vincularContato } = useAuth()
  const [tipo, setTipo] = useState(null)
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  if (!precisaVincular || dispensado) return null

  async function handleVincular(e) {
    e.preventDefault()
    setErro('')

    if (tipo === 'email' && (!valor || !valor.includes('@'))) {
      setErro('E-mail inválido.')
      return
    }
    if (tipo === 'telefone' && valor.replace(/\D/g, '').length < 10) {
      setErro('Telefone inválido.')
      return
    }

    setCarregando(true)
    try {
      const valorLimpo = tipo === 'telefone' ? valor.replace(/\D/g, '') : valor.trim()
      await vincularContato(tipo, valorLimpo)
      setSucesso(true)
      setTimeout(() => setDispensado(true), 2000)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  function formatarTelefone(value) {
    const nums = value.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return nums
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#202C33] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-[#2A3942] relative">
        <button
          onClick={() => setDispensado(true)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          <X size={18} />
        </button>

        {sucesso ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="font-bold text-lg">Vinculado!</h3>
            <p className="text-sm text-gray-500 dark:text-[#8696A0] mt-1">
              Agora você pode usar {tipo === 'email' ? 'e-mail' : 'WhatsApp'} para entrar.
            </p>
          </div>
        ) : !tipo ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">Facilite seu login</h3>
              <p className="text-sm text-gray-500 dark:text-[#8696A0] mt-1">
                Vincule um e-mail ou WhatsApp para entrar sem CPF+PIN
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setTipo('telefone')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-[#2A3942] hover:bg-gray-50 dark:hover:bg-[#2A3942] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <div>
                  <p className="font-medium text-sm">WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-[#8696A0]">Receba código no WhatsApp</p>
                </div>
              </button>
              <button
                onClick={() => setTipo('email')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-[#2A3942] hover:bg-gray-50 dark:hover:bg-[#2A3942] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">E-mail</p>
                  <p className="text-xs text-gray-500 dark:text-[#8696A0]">Receba link mágico por e-mail</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setDispensado(true)}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Fazer depois
            </button>
          </div>
        ) : (
          <form onSubmit={handleVincular} className="space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-lg">
                {tipo === 'email' ? 'Vincular E-mail' : 'Vincular WhatsApp'}
              </h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {tipo === 'email' ? 'E-mail' : 'Número do WhatsApp'}
              </label>
              {tipo === 'email' ? (
                <input
                  type="email"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-field"
                  autoFocus
                />
              ) : (
                <input
                  type="tel"
                  value={valor}
                  onChange={(e) => setValor(formatarTelefone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="input-field"
                  inputMode="tel"
                  autoFocus
                />
              )}
            </div>

            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={carregando} className="btn-primary flex-1">
                {carregando ? 'Salvando...' : 'Vincular'}
              </button>
              <button type="button" onClick={() => { setTipo(null); setErro('') }} className="btn-secondary">
                Voltar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
