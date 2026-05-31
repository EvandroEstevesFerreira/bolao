import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || ''
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || ''
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'bolao'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function gerarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function formatarTelefone(tel: string): string {
  return tel.replace(/\D/g, '').replace(/^0+/, '')
}

async function enviarWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.error('Evolution API não configurada')
    return false
  }

  const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      number: `55${telefone}`,
      text: mensagem,
    }),
  })

  return res.ok
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, telefone, codigo } = await req.json()

    if (action === 'enviar') {
      if (!telefone) {
        return respond({ error: 'Telefone obrigatório' }, 400)
      }

      const tel = formatarTelefone(telefone)
      if (tel.length < 10 || tel.length > 11) {
        return respond({ error: 'Telefone inválido' }, 400)
      }

      // Rate limit: max 3 OTPs por telefone em 10 minutos
      const { data: recentes } = await supabase
        .from('whatsapp_otp')
        .select('id')
        .eq('telefone', tel)
        .gte('criado_em', new Date(Date.now() - 10 * 60 * 1000).toISOString())

      if (recentes && recentes.length >= 3) {
        return respond({ error: 'Muitas tentativas. Aguarde 10 minutos.' }, 429)
      }

      const code = gerarCodigo()

      // Salvar OTP no banco
      await supabase.from('whatsapp_otp').insert({
        telefone: tel,
        codigo: code,
      })

      // Enviar via WhatsApp
      const mensagem = `🏆 *Bolão Copa 2026*\n\nSeu código de acesso: *${code}*\n\nVálido por 5 minutos.`
      const enviado = await enviarWhatsApp(tel, mensagem)

      if (!enviado) {
        return respond({ error: 'Falha ao enviar WhatsApp. Verifique o número.' }, 500)
      }

      return respond({ ok: true, message: 'Código enviado via WhatsApp' })
    }

    if (action === 'verificar') {
      if (!telefone || !codigo) {
        return respond({ error: 'Telefone e código obrigatórios' }, 400)
      }

      const tel = formatarTelefone(telefone)

      // Buscar OTP válido
      const { data: otp } = await supabase
        .from('whatsapp_otp')
        .select('*')
        .eq('telefone', tel)
        .eq('codigo', codigo)
        .eq('verificado', false)
        .gte('expira_em', new Date().toISOString())
        .order('criado_em', { ascending: false })
        .limit(1)
        .single()

      if (!otp) {
        return respond({ error: 'Código inválido ou expirado' }, 401)
      }

      // Verificar tentativas
      if (otp.tentativas >= 5) {
        return respond({ error: 'Muitas tentativas. Solicite novo código.' }, 429)
      }

      // Incrementar tentativas
      await supabase
        .from('whatsapp_otp')
        .update({ tentativas: otp.tentativas + 1 })
        .eq('id', otp.id)

      // Marcar como verificado
      await supabase
        .from('whatsapp_otp')
        .update({ verificado: true })
        .eq('id', otp.id)

      // Buscar ou criar perfil
      let { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('telefone', tel)
        .eq('ativo', true)
        .single()

      if (!perfil) {
        return respond({
          ok: true,
          verified: true,
          needsProfile: true,
          telefone: tel,
        })
      }

      // Criar sessão Supabase Auth se não existe
      let authUid = perfil.auth_uid
      if (!authUid) {
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          phone: `+55${tel}`,
          phone_confirm: true,
          user_metadata: { perfil_id: perfil.id, nickname: perfil.nickname },
        })

        if (authUser?.user) {
          authUid = authUser.user.id
          await supabase
            .from('perfis')
            .update({ auth_uid: authUid })
            .eq('id', perfil.id)
        }
      }

      // Gerar token de acesso
      if (authUid) {
        const { data: session } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: perfil.email || `${tel}@bolao.local`,
        })

        // Retornar perfil para login direto
        const { pin_hash: _, ...perfilSeguro } = perfil
        return respond({
          ok: true,
          verified: true,
          perfil: perfilSeguro,
          authUid,
        })
      }

      const { pin_hash: _, ...perfilSeguro } = perfil
      return respond({
        ok: true,
        verified: true,
        perfil: perfilSeguro,
      })
    }

    return respond({ error: 'Ação inválida' }, 400)
  } catch (err) {
    return respond({ error: String(err) }, 500)
  }
})

function respond(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
