import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { usuario_id, is_admin, admin_id } = await req.json()

    if (!usuario_id || !admin_id) {
      return respond({ error: 'Parâmetros obrigatórios: usuario_id, admin_id' }, 400)
    }

    const { data: admin } = await supabase
      .from('perfis')
      .select('is_admin')
      .eq('id', admin_id)
      .eq('is_admin', true)
      .single()

    if (!admin) {
      return respond({ error: 'Sem permissão. Apenas admins podem alterar.' }, 403)
    }

    const { error } = await supabase
      .from('perfis')
      .update({ is_admin: !!is_admin })
      .eq('id', usuario_id)

    if (error) {
      return respond({ error: error.message }, 500)
    }

    return respond({ ok: true, usuario_id, is_admin: !!is_admin })
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
