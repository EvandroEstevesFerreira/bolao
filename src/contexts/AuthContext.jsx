import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function chamarEdgeFunction(nome, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${nome}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data
}

export function AuthProvider({ children }) {
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    inicializar()
  }, [])

  async function inicializar() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      await carregarPerfilAuth(session.user)
      setCarregando(false)

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await carregarPerfilAuth(session.user)
        }
        if (event === 'SIGNED_OUT') {
          setPerfil(null)
          localStorage.removeItem('bolao_perfil')
        }
      })
      return () => subscription?.unsubscribe()
    }

    setCarregando(false)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await carregarPerfilAuth(session.user)
      }
      if (event === 'SIGNED_OUT') {
        setPerfil(null)
        localStorage.removeItem('bolao_perfil')
      }
    })

    return () => subscription?.unsubscribe()
  }

  async function carregarPerfilAuth(user) {
    let { data: perfilAuth } = await supabase
      .from('perfis')
      .select('id, cpf, nome, nickname, avatar_url, setor_cr, selecao_favorita_id, ativo, is_admin, auth_uid, email, telefone, criado_em')
      .eq('auth_uid', user.id)
      .eq('ativo', true)
      .single()

    if (!perfilAuth && user.email) {
      const { data: perfilEmail } = await supabase
        .from('perfis')
        .select('id, cpf, nome, nickname, avatar_url, setor_cr, selecao_favorita_id, ativo, is_admin, auth_uid, email, telefone, criado_em')
        .eq('email', user.email)
        .eq('ativo', true)
        .single()

      if (perfilEmail) {
        await supabase.from('perfis').update({ auth_uid: user.id }).eq('id', perfilEmail.id)
        perfilAuth = perfilEmail
      }
    }

    if (perfilAuth) {
      setPerfil(perfilAuth)
      localStorage.setItem('bolao_perfil', JSON.stringify(perfilAuth))
    }
  }

  async function loginEmail(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) throw new Error(error.message)
    return { enviado: true }
  }

  async function enviarOtpWhatsApp(telefone) {
    return chamarEdgeFunction('whatsapp-otp', { action: 'enviar', telefone })
  }

  async function verificarOtpWhatsApp(telefone, codigo) {
    const data = await chamarEdgeFunction('whatsapp-otp', { action: 'verificar', telefone, codigo })

    if (data.perfil) {
      setPerfil(data.perfil)
      localStorage.setItem('bolao_perfil', JSON.stringify(data.perfil))
    }

    return data
  }

  async function resgatarConvite(token, dadosOriginal) {
    const data = await chamarEdgeFunction('registro', {
      token,
      nome: dadosOriginal.nome,
      nickname: dadosOriginal.nickname,
      setor_cr: dadosOriginal.setor_cr || null,
      avatar_url: dadosOriginal.avatar_url || null,
    })

    if (data.token_hash) {
      await supabase.auth.verifyOtp({
        type: 'magiclink',
        token_hash: data.token_hash,
      })
    }

    if (data.perfil) {
      setPerfil(data.perfil)
      localStorage.setItem('bolao_perfil', JSON.stringify(data.perfil))
    }

    return data.perfil
  }

  async function logout() {
    await supabase.auth.signOut().catch(() => {})
    localStorage.removeItem('bolao_perfil')
    setPerfil(null)
  }

  async function atualizarPerfil(dados) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', perfil.id)
      .select('id, cpf, nome, nickname, avatar_url, setor_cr, selecao_favorita_id, ativo, is_admin, auth_uid, email, telefone, criado_em')
      .single()

    if (error) throw new Error('Erro ao atualizar perfil.')
    localStorage.setItem('bolao_perfil', JSON.stringify(data))
    setPerfil(data)
    return data
  }

  return (
    <AuthContext.Provider
      value={{
        perfil, carregando,
        loginEmail, enviarOtpWhatsApp, verificarOtpWhatsApp,
        logout, resgatarConvite, atualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
