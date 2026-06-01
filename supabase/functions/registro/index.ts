import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SALT = 'bolao-copa-2026'

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
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
    const { token, nome, nickname, pin, cpf, setor_cr, avatar_url } = await req.json()

    if (!token || !nome || !nickname || !pin) {
      return respond({ error: 'Token, nome, nickname e PIN são obrigatórios' }, 400)
    }

    const { data: convite, error: convErr } = await supabase
      .from('convites')
      .select('*')
      .eq('token', token)
      .is('usado_em', null)
      .single()

    if (convErr || !convite) {
      return respond({ error: 'Convite inválido ou já utilizado.' }, 400)
    }

    if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
      return respond({ error: 'Convite expirado.' }, 400)
    }

    if (convite.cpf && cpf && convite.cpf !== cpf) {
      return respond({ error: 'CPF não corresponde ao convite.' }, 400)
    }

    const pinHash = await hashPin(pin)

    let perfilFinal: any

    if (cpf) {
      const { data: existente } = await supabase
        .from('perfis')
        .select('*')
        .eq('cpf', cpf)
        .single()

      if (existente) {
        const { data, error } = await supabase
          .from('perfis')
          .update({ nickname, pin_hash: pinHash, setor_cr, avatar_url, ativo: true })
          .eq('id', existente.id)
          .select()
          .single()
        if (error) return respond({ error: 'Erro ao atualizar perfil.' }, 500)
        perfilFinal = data
      }
    }

    if (!perfilFinal) {
      const insertData: any = { nome, nickname, pin_hash: pinHash, setor_cr, avatar_url }
      if (cpf) insertData.cpf = cpf

      const { data, error } = await supabase
        .from('perfis')
        .insert(insertData)
        .select()
        .single()
      if (error) return respond({ error: 'Erro ao criar perfil: ' + error.message }, 500)
      perfilFinal = data
    }

    await supabase.from('convites').update({ usado_em: new Date().toISOString() }).eq('id', convite.id)

    if (convite.bolao_id) {
      await supabase.from('bolao_participantes').upsert({
        bolao_id: convite.bolao_id,
        usuario_id: perfilFinal.id,
        papel: 'jogador',
      })
    }

    const authEmail = `${perfilFinal.id}@bolao.internal`

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: authEmail,
      email_confirm: true,
    })

    if (!createErr && newUser?.user) {
      await supabase.from('perfis').update({ auth_uid: newUser.user.id }).eq('id', perfilFinal.id)
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authEmail,
    })

    const { pin_hash: _, ...perfilSeguro } = perfilFinal

    return respond({
      token_hash: linkData?.properties?.hashed_token || null,
      perfil: perfilSeguro,
    })
  } catch (err) {
    return respond({ error: String(err) }, 500)
  }
})
