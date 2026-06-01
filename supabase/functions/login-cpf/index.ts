import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SALT = 'bolao-copa-2026'
const SALT_LEGACY = 'bolao-sistenge-2026'

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verificarPin(pin: string, hash: string): Promise<boolean> {
  const pinHash = await hashPin(pin, SALT)
  if (pinHash === hash) return true
  const legacyHash = await hashPin(pin, SALT_LEGACY)
  return legacyHash === hash
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function respond(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cpf, pin } = await req.json()

    if (!cpf || !pin) {
      return respond({ error: 'CPF e PIN são obrigatórios' }, 400)
    }

    const { data: perfil, error: perfilErr } = await supabase
      .from('perfis')
      .select('*')
      .eq('cpf', cpf)
      .eq('ativo', true)
      .single()

    if (perfilErr || !perfil) {
      return respond({ error: 'CPF não encontrado ou acesso desativado.' }, 401)
    }

    if (perfil.pin_hash) {
      const isHash = perfil.pin_hash.length === 64 && /^[0-9a-f]+$/.test(perfil.pin_hash)

      if (isHash) {
        const ok = await verificarPin(pin, perfil.pin_hash)
        if (!ok) return respond({ error: 'PIN incorreto.' }, 401)

        const currentHash = await hashPin(pin, SALT)
        if (currentHash !== perfil.pin_hash) {
          await supabase.from('perfis').update({ pin_hash: currentHash }).eq('id', perfil.id)
        }
      } else {
        if (perfil.pin_hash !== pin) return respond({ error: 'PIN incorreto.' }, 401)
        const novoHash = await hashPin(pin, SALT)
        await supabase.from('perfis').update({ pin_hash: novoHash }).eq('id', perfil.id)
      }
    }

    const authEmail = `${perfil.id}@bolao.internal`
    let authUserId = perfil.auth_uid

    if (!authUserId) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existing = existingUsers?.users?.find((u: any) => u.email === authEmail)

      if (existing) {
        authUserId = existing.id
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: authEmail,
          email_confirm: true,
        })
        if (createErr) return respond({ error: 'Erro ao criar sessão: ' + createErr.message }, 500)
        authUserId = newUser.user.id
      }

      await supabase.from('perfis').update({ auth_uid: authUserId }).eq('id', perfil.id)
    }

    const { data: userData } = await supabase.auth.admin.getUserById(authUserId)
    const userEmail = userData?.user?.email || authEmail

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    })

    if (linkErr) return respond({ error: 'Erro ao gerar sessão: ' + linkErr.message }, 500)

    const { pin_hash: _, ...perfilSeguro } = perfil

    return respond({
      token_hash: linkData.properties.hashed_token,
      perfil: perfilSeguro,
      precisa_vincular: !perfil.email && !perfil.telefone,
    })
  } catch (err) {
    return respond({ error: String(err) }, 500)
  }
})
