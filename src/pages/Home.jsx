import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { formatarDataHora, jogoJaComecou } from '../lib/formatters'
import { Trophy, ClipboardList, Calendar, TrendingUp, Star, Award, Swords, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'

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
      supabase.from('selecoes').select('*'),
      supabase
        .from('partidas')
        .select('*')
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(5),
      supabase
        .from('palpites')
        .select('*')
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
      <div className="space-y-6">
        <div className="card bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Olá,</p>
              <h2 className="text-2xl font-bold">{perfil.nickname}</h2>
            </div>
            {ranking && (
              <div className="text-right">
                <p className="text-white/80 text-sm">Posição</p>
                <p className="text-3xl font-bold">#{ranking}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <TrendingUp className="mx-auto text-primary mb-1" size={24} />
            <p className="text-2xl font-bold">{stats.totalPontos}</p>
            <p className="text-xs text-gray-500">Pontos</p>
          </div>
          <div className="card text-center">
            <ClipboardList className="mx-auto text-primary mb-1" size={24} />
            <p className="text-2xl font-bold">{stats.totalPalpites}</p>
            <p className="text-xs text-gray-500">Palpites</p>
          </div>
          <div className="card text-center">
            <Calendar className="mx-auto text-primary mb-1" size={24} />
            <p className="text-2xl font-bold">{stats.totalJogos}</p>
            <p className="text-xs text-gray-500">Jogos</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Próximos Jogos</h3>
            <Link to="/palpites" className="text-primary text-sm font-semibold hover:underline">
              Ver todos
            </Link>
          </div>

          {proximosJogos.length === 0 ? (
            <div className="card text-center text-gray-500">
              <p>Nenhum jogo agendado.</p>
              <p className="text-sm mt-1">A Copa começa em 11/06/2026!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximosJogos.map(jogo => (
                <Link key={jogo.id} to="/palpites" className="card flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    {selecoes[jogo.selecao_casa_id]?.bandeira_url && (
                      <img src={selecoes[jogo.selecao_casa_id].bandeira_url} alt="" className="w-6 h-4 rounded" />
                    )}
                    <span className="font-semibold text-sm">
                      {selecoes[jogo.selecao_casa_id]?.codigo_fifa || '?'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">{formatarDataHora(jogo.data_hora)}</p>
                    <p className="text-xs text-gray-400">{jogo.grupo ? `Grupo ${jogo.grupo}` : jogo.fase}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/destaques" className="card text-center hover:shadow-md transition-shadow">
            <Star className="mx-auto text-yellow-500 mb-1" size={20} />
            <p className="text-xs font-semibold">Destaques</p>
          </Link>
          <Link to="/conquistas" className="card text-center hover:shadow-md transition-shadow">
            <Award className="mx-auto text-purple-500 mb-1" size={20} />
            <p className="text-xs font-semibold">Conquistas</p>
          </Link>
          <Link to="/cara-a-cara" className="card text-center hover:shadow-md transition-shadow">
            <Swords className="mx-auto text-blue-500 mb-1" size={20} />
            <p className="text-xs font-semibold">Cara a Cara</p>
          </Link>
          <Link to="/bonus" className="card text-center hover:shadow-md transition-shadow">
            <Trophy className="mx-auto text-primary mb-1" size={20} />
            <p className="text-xs font-semibold">Palpite Bônus</p>
          </Link>
        </div>

        <Link
          to="/regulamento"
          className="block card text-center text-primary font-semibold hover:shadow-md transition-shadow"
        >
          <Trophy className="mx-auto mb-1" size={20} />
          Ver Regulamento
        </Link>
      </div>
    </Layout>
  )
}
