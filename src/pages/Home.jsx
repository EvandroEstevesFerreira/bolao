import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatarDataHora, jogoJaComecou } from '../lib/formatters'
import { Trophy, ClipboardList, Calendar, TrendingUp, Star, Award, Swords, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'
import Tour from '../components/Tour'

export default function Home() {
  const { perfil } = useAuth()
  const [ranking, setRanking] = useState(null)
  const [proximosJogos, setProximosJogos] = useState([])
  const [stats, setStats] = useState({ totalPalpites: 0, totalPontos: 0, totalJogos: 0 })
  const [selecoes, setSelecoes] = useState({})

  useEffect(() => {
    carregarDados()
  }, [perfil])

  async function carregarDados() {
    const [selRes, jogosRes, palpitesRes, rankRes] = await Promise.all([
      supabase.from('selecoes').select('id, nome, codigo_fifa, bandeira_url, grupo'),
      supabase
        .from('partidas')
        .select('id, selecao_casa_id, selecao_fora_id, data_hora, grupo, fase, status')
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(5),
      supabase
        .from('palpites')
        .select('partida_id, pontos')
        .eq('usuario_id', perfil.id),
      supabase
        .from('palpites')
        .select('usuario_id, pontos')
    ])

    if (selRes.data) {
      const map = {}
      selRes.data.forEach(s => { map[s.id] = s })
      setSelecoes(map)
    }

    if (jogosRes.data) setProximosJogos(jogosRes.data)

    if (palpitesRes.data) {
      const totalPontos = palpitesRes.data.reduce((acc, p) => acc + (p.pontos || 0), 0)
      setStats({
        totalPalpites: palpitesRes.data.length,
        totalPontos,
        totalJogos: 104,
      })
    }

    if (rankRes.data) {
      const porUsuario = {}
      rankRes.data.forEach(p => {
        if (!porUsuario[p.usuario_id]) porUsuario[p.usuario_id] = 0
        porUsuario[p.usuario_id] += p.pontos || 0
      })
      const sorted = Object.entries(porUsuario).sort((a, b) => b[1] - a[1])
      const pos = sorted.findIndex(([id]) => id === perfil.id)
      setRanking(pos >= 0 ? pos + 1 : null)
    }
  }

  return (
    <Layout>
      <Tour />
      <div className="space-y-5">
        <div className="card border-0 bg-[#075E54] dark:bg-[#1A2E28] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Olá,</p>
              <h2 className="text-2xl font-bold tracking-tight">{perfil.nickname}</h2>
            </div>
            {ranking && (
              <div className="text-right">
                <p className="text-white/60 text-sm">Posição</p>
                <p className="text-4xl font-black tabular-nums">#{ranking}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card border-0 bg-[#00A884] text-white text-center p-4">
            <TrendingUp className="mx-auto mb-1.5 opacity-70" size={22} />
            <p className="text-2xl font-bold tabular-nums">{stats.totalPontos}</p>
            <p className="text-[11px] text-white/60 mt-0.5">Pontos</p>
          </div>
          <div className="card border-0 bg-[#075E54] text-white text-center p-4">
            <ClipboardList className="mx-auto mb-1.5 opacity-70" size={22} />
            <p className="text-2xl font-bold tabular-nums">{stats.totalPalpites}</p>
            <p className="text-[11px] text-white/60 mt-0.5">Palpites</p>
          </div>
          <div className="card border-0 bg-[#128C7E] text-white text-center p-4">
            <Calendar className="mx-auto mb-1.5 opacity-70" size={22} />
            <p className="text-2xl font-bold tabular-nums">{stats.totalJogos}</p>
            <p className="text-[11px] text-white/60 mt-0.5">Jogos</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base">Próximos Jogos</h3>
            <Link to="/palpites" className="text-primary text-sm font-semibold hover:underline">
              Ver todos
            </Link>
          </div>

          {proximosJogos.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-400">Nenhum jogo agendado.</p>
              <p className="text-sm text-gray-400 mt-1">A Copa começa em 11/06/2026!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {proximosJogos.map(jogo => (
                <Link key={jogo.id} to="/palpites" className="card flex items-center justify-between py-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selecoes[jogo.selecao_casa_id]?.bandeira_url && (
                      <img src={selecoes[jogo.selecao_casa_id].bandeira_url} alt="" className="w-6 h-4 rounded" />
                    )}
                    <span className="font-bold text-sm">
                      {selecoes[jogo.selecao_casa_id]?.codigo_fifa || '?'}
                    </span>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-xs text-gray-500 dark:text-[#8696A0]">{formatarDataHora(jogo.data_hora)}</p>
                    <p className="text-[11px] text-gray-400 dark:text-[#8696A0]/70">{jogo.grupo ? `Grupo ${jogo.grupo}` : jogo.fase}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="font-bold text-sm">
                      {selecoes[jogo.selecao_fora_id]?.codigo_fifa || '?'}
                    </span>
                    {selecoes[jogo.selecao_fora_id]?.bandeira_url && (
                      <img src={selecoes[jogo.selecao_fora_id].bandeira_url} alt="" className="w-6 h-4 rounded" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { to: '/destaques', icon: Star, label: 'Destaques', color: 'text-yellow-500', bg: 'bg-yellow-500/10 dark:bg-yellow-500/15' },
            { to: '/conquistas', icon: Award, label: 'Conquistas', color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/15' },
            { to: '/cara-a-cara', icon: Swords, label: 'Cara a Cara', color: 'text-[#128C7E]', bg: 'bg-[#128C7E]/10 dark:bg-[#128C7E]/15' },
            { to: '/bonus', icon: Trophy, label: 'Palpite Bônus', color: 'text-amber-500', bg: 'bg-amber-500/10 dark:bg-amber-500/15' },
          ].map(({ to, icon: Icon, label, color, bg }) => (
            <Link key={to} to={to} className="card text-center py-4 hover:border-primary/20 active:scale-[0.97] transition-all">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={color} size={20} />
              </div>
              <p className="text-xs font-semibold">{label}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/regulamento"
          className="block card border-primary/20 bg-primary/5 dark:bg-primary/10 text-center text-primary font-semibold py-4 hover:bg-primary/10 dark:hover:bg-primary/15 active:scale-[0.98] transition-all"
        >
          <Trophy className="mx-auto mb-1" size={18} />
          <span className="text-sm">Ver Regulamento</span>
        </Link>
      </div>
    </Layout>
  )
}
