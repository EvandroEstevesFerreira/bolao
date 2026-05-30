import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Edit3, Save } from 'lucide-react'
import Layout from '../components/Layout'

export default function Perfil() {
  const { perfil, atualizarPerfil } = useAuth()
  const [editando, setEditando] = useState(false)
  const [nickname, setNickname] = useState(perfil.nickname || '')
  const [setorCr, setSetorCr] = useState(perfil.setor_cr || '')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function handleSalvar() {
    if (!nickname.trim() || nickname.trim().length < 3) {
      setMensagem('Apelido deve ter pelo menos 3 caracteres.')
      return
    }
    setSalvando(true)
    try {
      await atualizarPerfil({
        nickname: nickname.trim(),
        setor_cr: setorCr.trim() || null,
      })
      setEditando(false)
      setMensagem('Perfil atualizado!')
      setTimeout(() => setMensagem(''), 3000)
    } catch (err) {
      setMensagem(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold">Meu Perfil</h2>

        <div className="card text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={32} className="text-primary" />
            )}
          </div>

          {editando ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Apelido</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">CR / Setor</label>
                <input
                  type="text"
                  value={setorCr}
                  onChange={(e) => setSetorCr(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSalvar} disabled={salvando} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={16} />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => setEditando(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold">{perfil.nickname}</h3>
              <p className="text-gray-500 text-sm">{perfil.nome}</p>
              {perfil.setor_cr && (
                <span className="inline-block mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                  {perfil.setor_cr}
                </span>
              )}
              <button
                onClick={() => setEditando(true)}
                className="mt-4 text-primary text-sm font-semibold flex items-center justify-center gap-1 mx-auto hover:underline"
              >
                <Edit3 size={14} />
                Editar perfil
              </button>
            </>
          )}

          {mensagem && (
            <p className={`mt-3 text-sm ${mensagem.includes('atualizado') ? 'text-green-600' : 'text-red-500'}`}>
              {mensagem}
            </p>
          )}
        </div>

        <div className="card">
          <h4 className="font-semibold mb-3">Informações</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium">{perfil.nome}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Apelido</dt>
              <dd className="font-medium">{perfil.nickname}</dd>
            </div>
            {perfil.setor_cr && (
              <div className="flex justify-between">
                <dt className="text-gray-500">CR/Setor</dt>
                <dd className="font-medium">{perfil.setor_cr}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Membro desde</dt>
              <dd className="font-medium">
                {new Date(perfil.criado_em).toLocaleDateString('pt-BR')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  )
}
