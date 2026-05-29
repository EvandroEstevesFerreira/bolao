import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const perfilSalvo = localStorage.getItem('bolao_perfil')
    if (perfilSalvo) {
      try {
        setPerfil(JSON.parse(perfilSalvo))
      } catch {
        localStorage.removeItem('bolao_perfil')
      }
    }
    setCarregando(false)
  }, [])

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

    if (data.pin_hash && data.pin_hash !== pin) {
      throw new Error('PIN incorreto.')
    }

    localStorage.setItem('bolao_perfil', JSON.stringify(data))
    setPerfil(data)
    return data
  }

  async function resgatarConvite(token, dadosPerfil) {
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

    if (convite.cpf && convite.cpf !== dadosPerfil.cpf) {
      throw new Error('CPF não corresponde ao convite.')
    }

    const { data: perfilExistente } = await supabase
      .from('perfis')
      .select('*')
      .eq('cpf', dadosPerfil.cpf)
      .single()

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
        .eq('cpf', dadosPerfil.cpf)
        .select()
        .single()

      if (error) throw new Error('Erro ao atualizar perfil.')
      perfilFinal = data
    } else {
      const { data, error } = await supabase
        .from('perfis')
        .insert({
          cpf: dadosPerfil.cpf,
          nome: dadosPerfil.nome,
          nickname: dadosPerfil.nickname,
          pin_hash: dadosPerfil.pin,
          setor_cr: dadosPerfil.setor_cr,
          avatar_url: dadosPerfil.avatar_url,
        })
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

    localStorage.setItem('bolao_perfil', JSON.stringify(perfilFinal))
    setPerfil(perfilFinal)
    return perfilFinal
  }

  function logout() {
    localStorage.removeItem('bolao_perfil')
    setPerfil(null)
  }

  async function atualizarPerfil(dados) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', perfil.id)
      .select()
      .single()

    if (error) throw new Error('Erro ao atualizar perfil.')
    localStorage.setItem('bolao_perfil', JSON.stringify(data))
    setPerfil(data)
    return data
  }

  return (
    <AuthContext.Provider
      value={{ perfil, carregando, login, logout, resgatarConvite, atualizarPerfil }}
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
