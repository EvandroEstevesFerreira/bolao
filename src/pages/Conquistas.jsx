import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Award, Star, Flame, Eye, Target, TrendingDown, Zap } from 'lucide-react'
import Layout from '../components/Layout'

const BADGES = {
  cravada: { label: 'Cravada', desc: 'Acertou o placar exato', icon: Target, cor: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' },
  vidente: { label: 'Vidente', desc: '3 cravadas no torneio', icon: Eye, cor: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10' },
  pe_quente: { label: 'Pé Quente', desc: '5 vencedores seguidos', icon: Flame, cor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
  rodada_perfeita: { label: 'Rodada Perfeita', desc: 'Acertou todos da rodada', icon: Star, cor: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
  zebra: { label: 'Zebra', desc: 'Acertou um resultado improvável', icon: Zap, cor: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
  lanterna: { label: 'Lanterna', desc: 'Último colocado (com carinho)', icon: TrendingDown, cor: 'text-gray-400 bg-gray-50 dark:bg-[#2A3942]' },
}

export default function Conquistas() {
  const { perfil } = useAuth()
  const [conquistas, setConquistas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [todosUsuarios, setTodosUsuarios] = useState([])

  useEffect(() => {
    carregarConquistas()
  }, [])

  async function carregarConquistas() {
    setCarregando(true)
    const [cRes, uRes] = await Promise.all([
      supabase.from('conquistas').select('*').eq('usuario_id', perfil.id).order('ganho_em', { ascending: false }),
      supabase.from('conquistas').select('tipo, usuario_id, perfis(nickname)').order('ganho_em', { ascending: false }).limit(20),
    ])
    setConquistas(cRes.data || [])
    setTodosUsuarios(uRes.data || [])
    setCarregando(false)
  }

  const minhasConquistasTipos = new Set(conquistas.map(c => c.tipo))

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="text-primary" size={24} />
          Conquistas
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(BADGES).map(([tipo, badge]) => {
            const conquistado = minhasConquistasTipos.has(tipo)
            const count = conquistas.filter(c => c.tipo === tipo).length
            const Icon = badge.icon
            return (
              <div
                key={tipo}
                className={`card text-center transition-all ${
                  conquistado ? 'ring-2 ring-primary shadow-md' : 'opacity-50 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 ${badge.cor}`}>
                  <Icon size={28} />
                </div>
                <h4 className="font-bold text-sm">{badge.label}</h4>
                <p className="text-xs text-gray-500 dark:text-[#8696A0] mt-1">{badge.desc}</p>
                {conquistado && count > 0 && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary text-white rounded-full text-xs font-bold">
                    ×{count}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3">Últimas conquistas do bolão</h3>
          {carregando ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : todosUsuarios.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-[#8696A0] py-4">Nenhuma conquista desbloqueada ainda.</p>
          ) : (
            <div className="space-y-2">
              {todosUsuarios.map((c, i) => {
                const badge = BADGES[c.tipo]
                if (!badge) return null
                const Icon = badge.icon
                return (
                  <div key={i} className="card flex items-center gap-3 py-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.cor}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.perfis?.nickname || 'Jogador'}</p>
                      <p className="text-xs text-gray-500 dark:text-[#8696A0]">{badge.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
