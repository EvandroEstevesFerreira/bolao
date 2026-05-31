import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Lock, Check } from 'lucide-react'
import Layout from '../components/Layout'

export default function PalpiteBonus() {
  const { perfil } = useAuth()
  const [selecoes, setSelecoes] = useState([])
  const [campeaoId, setCampeaoId] = useState(null)
  const [viceId, setViceId] = useState(null)
  const [bolaoId, setBolaoId] = useState(null)
  const [salvo, setSalvo] = useState(false)
  const [travado, setTravado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const [selRes, bpRes] = await Promise.all([
      supabase.from('selecoes').select('*').order('nome'),
      supabase.from('bolao_participantes').select('bolao_id').eq('usuario_id', perfil.id).limit(1).single(),
    ])

    setSelecoes(selRes.data || [])

    let bid = bpRes.data?.bolao_id
    if (!bid) {
      const { data } = await supabase.from('boloes').select('id').limit(1).single()
      bid = data?.id
    }
    setBolaoId(bid)

    if (bid) {
      const { data: bonus } = await supabase
        .from('palpites_bonus')
        .select('*')
        .eq('usuario_id', perfil.id)
        .eq('bolao_id', bid)
        .single()

      if (bonus) {
        setCampeaoId(bonus.campeao_id)
        setViceId(bonus.vice_id)
      }
    }

    const { data: primeiroJogo } = await supabase
      .from('partidas')
      .select('data_hora')
      .order('data_hora', { ascending: true })
      .limit(1)
      .single()

    if (primeiroJogo && new Date(primeiroJogo.data_hora) <= new Date()) {
      setTravado(true)
    }

    setCarregando(false)
  }

  async function salvar() {
    if (!bolaoId || !campeaoId || travado) return
    if (campeaoId === viceId) return

    setSalvando(true)
    const { error } = await supabase.from('palpites_bonus').upsert({
      usuario_id: perfil.id,
      bolao_id: bolaoId,
      campeao_id: campeaoId,
      vice_id: viceId,
    })

    if (!error) {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    }
    setSalvando(false)
  }

  const campeaoSel = selecoes.find(s => s.id === campeaoId)
  const viceSel = selecoes.find(s => s.id === viceId)

  return (
    <Layout>
      <div className="space-y-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="text-primary" size={24} />
          Palpite Bônus
        </h2>

        <div className="card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Escolha quem será o <strong>campeão</strong> e o <strong>vice</strong> da Copa 2026.
            Esses palpites valem pontos bônus no final do torneio!
          </p>
          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
            Campeão correto: <strong>+20 pts</strong> · Vice correto: <strong>+10 pts</strong>
          </div>
        </div>

        {travado && (
          <div className="card bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 flex items-center gap-2">
            <Lock size={16} className="text-orange-500 dark:text-orange-400" />
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Palpites bônus travados — a Copa já começou.
            </p>
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Campeão
                {campeaoSel && (
                  <span className="ml-2 text-primary">— {campeaoSel.nome} ({campeaoSel.codigo_fifa})</span>
                )}
              </label>
              <select
                value={campeaoId || ''}
                onChange={(e) => setCampeaoId(parseInt(e.target.value) || null)}
                disabled={travado}
                className="input-field"
              >
                <option value="">Selecione o campeão...</option>
                {selecoes.map(s => (
                  <option key={s.id} value={s.id} disabled={s.id === viceId}>
                    {s.nome} ({s.codigo_fifa}) — Grupo {s.grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Vice-campeão
                {viceSel && (
                  <span className="ml-2 text-primary">— {viceSel.nome} ({viceSel.codigo_fifa})</span>
                )}
              </label>
              <select
                value={viceId || ''}
                onChange={(e) => setViceId(parseInt(e.target.value) || null)}
                disabled={travado}
                className="input-field"
              >
                <option value="">Selecione o vice...</option>
                {selecoes.map(s => (
                  <option key={s.id} value={s.id} disabled={s.id === campeaoId}>
                    {s.nome} ({s.codigo_fifa}) — Grupo {s.grupo}
                  </option>
                ))}
              </select>
            </div>

            {!travado && (
              <button
                onClick={salvar}
                disabled={!campeaoId || salvando || campeaoId === viceId}
                className="btn-primary w-full"
              >
                {salvando ? 'Salvando...' : 'Salvar Palpite Bônus'}
              </button>
            )}

            {salvo && (
              <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                <Check size={16} />
                Palpite bônus salvo!
              </div>
            )}

            {campeaoId && campeaoId === viceId && (
              <p className="text-red-500 text-sm text-center">Campeão e vice devem ser seleções diferentes.</p>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
