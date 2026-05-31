import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatarMoeda } from '../lib/formatters'
import { Users, Plus, LogIn } from 'lucide-react'
import Layout from '../components/Layout'

export default function Boloes() {
  const { perfil } = useAuth()
  const [boloes, setBoloes] = useState([])
  const [meusBoloes, setMeusBoloes] = useState(new Set())
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => { carregarBoloes() }, [])

  async function carregarBoloes() {
    setCarregando(true)
    const [boloesRes, meusRes] = await Promise.all([
      supabase.from('boloes').select('*, bolao_participantes(count)'),
      supabase.from('bolao_participantes').select('bolao_id').eq('usuario_id', perfil.id),
    ])

    setBoloes(boloesRes.data || [])
    setMeusBoloes(new Set((meusRes.data || []).map(b => b.bolao_id)))
    setCarregando(false)
  }

  async function entrarPorCodigo() {
    if (!codigo.trim()) return
    setMensagem('')

    const { data: bolao } = await supabase
      .from('boloes')
      .select('id')
      .eq('codigo_convite', codigo.trim())
      .single()

    if (!bolao) {
      setMensagem('Código não encontrado.')
      return
    }

    const { error } = await supabase.from('bolao_participantes').upsert({
      bolao_id: bolao.id,
      usuario_id: perfil.id,
      papel: 'jogador',
    })

    if (error) {
      setMensagem('Erro ao entrar no bolão.')
    } else {
      setMensagem('Você entrou no bolão!')
      setCodigo('')
      carregarBoloes()
      setTimeout(() => setMensagem(''), 3000)
    }
  }

  async function entrarNoBolao(bolaoId) {
    const { error } = await supabase.from('bolao_participantes').upsert({
      bolao_id: bolaoId,
      usuario_id: perfil.id,
      papel: 'jogador',
    })

    if (!error) {
      carregarBoloes()
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Bolões</h2>

        <div className="card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <LogIn size={16} /> Entrar por código
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="Código do bolão"
              className="input-field flex-1"
            />
            <button onClick={entrarPorCodigo} className="btn-primary">Entrar</button>
          </div>
          {mensagem && (
            <p className={`text-sm mt-2 ${mensagem.includes('entrou') ? 'text-green-600' : 'text-red-500'}`}>
              {mensagem}
            </p>
          )}
        </div>

        {carregando ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : boloes.length === 0 ? (
          <div className="card text-center text-gray-500 py-8">
            <p>Nenhum bolão disponível.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {boloes.map(b => {
              const participa = meusBoloes.has(b.id)
              const numParticipantes = b.bolao_participantes?.[0]?.count || 0

              return (
                <div key={b.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold">{b.nome}</h4>
                      {b.descricao && <p className="text-sm text-gray-500 mt-1">{b.descricao}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-[#8696A0]">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {numParticipantes} participantes
                        </span>
                        {b.valor_inscricao > 0 && (
                          <span>Inscrição: {formatarMoeda(b.valor_inscricao)}</span>
                        )}
                      </div>
                    </div>
                    {participa ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400 rounded-full text-xs font-semibold">
                        Participando
                      </span>
                    ) : (
                      <button
                        onClick={() => entrarNoBolao(b.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Entrar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
