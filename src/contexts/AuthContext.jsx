import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { hashPin, verificarPin } from '../lib/hash'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [precisaVincular, setPrecisaVincular] = useState(false)

  useEffect(() => {
    inicializar()
  }, [])

  async function inicializar() {
    // 1. Verificar sessão Supabase Auth
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: perfilAuth } = await supabase
        .from('perfis')
        .select('*')
        .eq('auth_uid', session.user.id)
        .eq('ativo', true)
        .single()

      if (perfilAuth) {
        const { pin_hash: _, ...seguro } = perfilAuth
        setPerfil(seguro)
        localStorage.setItem('bolao_perfil', JSON.stringify(seguro))
        setCarregando(false)
        return
      }
    }

    // 2. Fallback: localStorage (legado CPF+PIN)
    const perfilSalvo = localStorage.getItem('bolao_perfil')
    if (perfilSalvo) {
      try {
        setPerfil(JSON.parse(perfilSalvo))
      } catch {
        localStorage.removeItem('bolao_perfil')
      }
    }
    setCarregando(false)

    // 3. Listener para mudanças de auth (magic link callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user

        // Buscar perfil vinculado
        let { data: perfilAuth } = await supabase
          .from('perfis')
          .select('*')
          .eq('auth_uid', user.id)
          .eq('ativo', true)
          .single()

        // Se não achou por auth_uid, tentar por email
        if (!perfilAuth && user.email) {
          const { data: perfilEmail } = await supabase
            .from('perfis')
            .select('*')
            .eq('email', user.email)
            .eq('ativo', true)
            .single()

          if (perfilEmail) {
            await supabase
              .from('perfis')
              .update({ auth_uid: user.id })
              .eq('id', perfilEmail.id)
            perfilAuth = perfilEmail
          }
        }

        if (perfilAuth) {
          const { pin_hash: _, ...seguro } = perfilAuth
          setPerfil(seguro)
          localStorage.setItem('bolao_perfil', JSON.stringify(seguro))
        }
      }

      if (event === 'SIGNED_OUT') {
        setPerfil(null)
        localStorage.removeItem('bolao_perfil')
      }
    })

    return () => subscription?.unsubscribe()
  }

  // Login legado CPF + PIN
  async function login(cpf, pin) {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('cpf', cpf)
      .eq('ativo', true)
      .single()

    if (error || !data) {
      throw new Error('CPF não encontrado ou acesso desativado.')
    }

    if (data.pin_hash) {
      const isHash = data.pin_hash.length === 64 && /^[0-9a-f]+$/.test(data.pin_hash)

      if (isHash) {
        const ok = await verificarPin(pin, data.pin_hash)
        if (!ok) throw new Error('PIN incorreto.')
        const currentHash = await hashPin(pin)
        if (currentHash !== data.pin_hash) {
          await supabase.from('perfis').update({ pin_hash: currentHash }).eq('id', data.id)
        }
      } else {
        if (data.pin_hash !== pin) throw new Error('PIN incorreto.')
        const novoHash = await hashPin(pin)
        await supabase.from('perfis').update({ pin_hash: novoHash }).eq('id', data.id)
      }
    }

    const { pin_hash: _, ...perfilSeguro } = data
    localStorage.setItem('bolao_perfil', JSON.stringify(perfilSeguro))
    setPerfil(perfilSeguro)

    // Verificar se precisa vincular email/telefone
    if (!data.email && !data.telefone) {
      setPrecisaVincular(true)
    }

    return perfilSeguro
  }

  // Login por E-mail Magic Link
  async function loginEmail(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw new Error(error.message)
    return { enviado: true }
  }

  // Login por WhatsApp OTP
  async function enviarOtpWhatsApp(telefone) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-otp`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'enviar', telefone }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar código')
    return data
  }

  async function verificarOtpWhatsApp(telefone, codigo) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-otp`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'verificar', telefone, codigo }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao verificar código')

    if (data.perfil) {
      localStorage.setItem('bolao_perfil', JSON.stringify(data.perfil))
      setPerfil(data.perfil)
    }

    return data
  }

  // Vincular email ou telefone ao perfil existente
  async function vincularContato(tipo, valor) {
    if (!perfil) throw new Error('Não autenticado')

    const campo = tipo === 'email' ? 'email' : 'telefone'
    const { error } = await supabase
      .from('perfis')
      .update({ [campo]: valor })
      .eq('id', perfil.id)

    if (error) {
      if (error.code === '23505') throw new Error(`${tipo === 'email' ? 'E-mail' : 'Telefone'} já cadastrado por outro usuário.`)
      throw new Error('Erro ao vincular contato.')
    }

    const novoPerfil = { ...perfil, [campo]: valor }
    localStorage.setItem('bolao_perfil', JSON.stringify(novoPerfil))
    setPerfil(novoPerfil)
    setPrecisaVincular(false)
  }

  async function resgatarConvite(token, dadosOriginal) {
    const dadosPerfil = { ...dadosOriginal, pin: await hashPin(dadosOriginal.pin) }
    const { data: convite, error: errConvite } = await supabase
      .from('convites')
      .select('*')
      .eq('token', token)
      .is('usado_em', null)
      .single()

    if (errConvite || !convite) {
      throw new Error('Convite inválido ou já utilizado.')
    }

    if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
      throw new Error('Convite expirado.')
    }

    if (convite.cpf && dadosPerfil.cpf && convite.cpf !== dadosPerfil.cpf) {
      throw new Error('CPF não corresponde ao convite.')
    }

    let perfilExistente = null
    if (dadosPerfil.cpf) {
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('cpf', dadosPerfil.cpf)
        .single()
      perfilExistente = data
    }

    let perfilFinal

    if (perfilExistente) {
      const { data, error } = await supabase
        .from('perfis')
        .update({
          nickname: dadosPerfil.nickname,
          pin_hash: dadosPerfil.pin,
          setor_cr: dadosPerfil.setor_cr,
          avatar_url: dadosPerfil.avatar_url,
          ativo: true,
        })
        .eq('id', perfilExistente.id)
        .select()
        .single()

      if (error) throw new Error('Erro ao atualizar perfil.')
      perfilFinal = data
    } else {
      const insertData = {
        nome: dadosPerfil.nome,
        nickname: dadosPerfil.nickname,
        pin_hash: dadosPerfil.pin,
        setor_cr: dadosPerfil.setor_cr,
        avatar_url: dadosPerfil.avatar_url,
      }
      if (dadosPerfil.cpf) insertData.cpf = dadosPerfil.cpf

      const { data, error } = await supabase
        .from('perfis')
        .insert(insertData)
        .select()
        .single()

      if (error) throw new Error('Erro ao criar perfil: ' + error.message)
      perfilFinal = data
    }

    await supabase
      .from('convites')
      .update({ usado_em: new Date().toISOString() })
      .eq('id', convite.id)

    if (convite.bolao_id) {
      await supabase.from('bolao_participantes').upsert({
        bolao_id: convite.bolao_id,
        usuario_id: perfilFinal.id,
        papel: 'jogador',
      })
    }

    const { pin_hash: _, ...perfilSeguro } = perfilFinal
    localStorage.setItem('bolao_perfil', JSON.stringify(perfilSeguro))
    setPerfil(perfilSeguro)
    return perfilSeguro
  }

  async function logout() {
    await supabase.auth.signOut().catch(() => {})
    localStorage.removeItem('bolao_perfil')
    setPerfil(null)
    setPrecisaVincular(false)
  }

  async function atualizarPerfil(dados) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', perfil.id)
      .select()
      .single()

    if (error) throw new Error('Erro ao atualizar perfil.')
    const { pin_hash: _, ...seguro } = data
    localStorage.setItem('bolao_perfil', JSON.stringify(seguro))
    setPerfil(seguro)
    return seguro
  }

  return (
    <AuthContext.Provider
      value={{
        perfil, carregando, precisaVincular,
        login, loginEmail, enviarOtpWhatsApp, verificarOtpWhatsApp,
        vincularContato, logout, resgatarConvite, atualizarPerfil,
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
