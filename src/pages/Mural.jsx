import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Send, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'

export default function Mural() {
  const { perfil } = useAuth()
  const [comentarios, setComentarios] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [bolaoId, setBolaoId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    carregarBolao()
  }, [])

  useEffect(() => {
    if (!bolaoId) return

    carregarComentarios()

    const channel = supabase
      .channel('mural-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comentarios',
        filter: `bolao_id=eq.${bolaoId}`,
      }, (payload) => {
        carregarComentarios()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bolaoId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comentarios])

  async function carregarBolao() {
    const { data } = await supabase
      .from('bolao_participantes')
      .select('bolao_id')
      .eq('usuario_id', perfil.id)
      .limit(1)
      .single()

    if (data) {
      setBolaoId(data.bolao_id)
    } else {
      const { data: boloes } = await supabase.from('boloes').select('id').limit(1).single()
      if (boloes) setBolaoId(boloes.id)
    }
    setCarregando(false)
  }

  async function carregarComentarios() {
    if (!bolaoId) return
    const { data } = await supabase
      .from('comentarios')
      .select('*, perfis(nickname, avatar_url)')
      .eq('bolao_id', bolaoId)
      .order('criado_em', { ascending: true })
      .limit(100)
    setComentarios(data || [])
  }

  async function enviarComentario(e) {
    e.preventDefault()
    if (!texto.trim() || !bolaoId || enviando) return

    setEnviando(true)
    const { error } = await supabase.from('comentarios').insert({
      bolao_id: bolaoId,
      usuario_id: perfil.id,
      texto: texto.trim(),
    })

    if (!error) {
      setTexto('')
      carregarComentarios()
    }
    setEnviando(false)
  }

  function formatarHora(data) {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <MessageCircle className="text-primary" size={24} />
          Mural de Zoeira
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {carregando ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !bolaoId ? (
            <div className="card text-center text-gray-500 py-8">
              <p>Você precisa estar em um bolão para usar o mural.</p>
            </div>
          ) : comentarios.length === 0 ? (
            <div className="card text-center text-gray-500 py-8">
              <p>Nenhuma mensagem ainda. Seja o primeiro a zoar!</p>
            </div>
          ) : (
            comentarios.map(c => {
              const isMe = c.usuario_id === perfil.id
              return (
                <div
                  key={c.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-bold text-primary mb-1">
                        {c.perfis?.nickname || 'Jogador'}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{c.texto}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                      {formatarHora(c.criado_em)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {bolaoId && (
          <form onSubmit={enviarComentario} className="flex gap-2 pt-3 border-t border-gray-200">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Manda a zoeira..."
              className="input-field flex-1"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              className="btn-primary px-4"
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
