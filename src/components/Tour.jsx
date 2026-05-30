import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, Trophy, MessageCircle, User, Star,
  Award, Swords, Tv, Users, BookOpen, ChevronRight,
  ChevronLeft, X, Sparkles,
} from 'lucide-react'

const PASSOS = [
  {
    titulo: 'Bem-vindo ao Bolão Copa 2026!',
    icone: Sparkles,
    corIcone: 'text-yellow-500',
    descricao: 'Este é o seu espaço para palpitar nos jogos da Copa do Mundo 2026. Acompanhe seus pontos, dispute o ranking com os amigos e conquiste premiações!',
    exemplo: 'A cada jogo da Copa, você dá seu palpite de placar. Quanto mais perto do resultado real, mais pontos você ganha.',
    dica: 'Dica: explore todas as funcionalidades pelo menu superior e pela barra de navegação inferior.',
  },
  {
    titulo: 'Palpites',
    icone: ClipboardList,
    corIcone: 'text-blue-500',
    rota: '/palpites',
    descricao: 'Aqui você faz seus palpites para cada jogo da Copa. Escolha o placar que acha que vai acontecer e confirme. Você pode editar seu palpite quantas vezes quiser até 10 minutos antes do jogo.',
    exemplo: 'Exemplo: Brasil 2 x 1 Argentina. Se o resultado for exatamente 2x1, você ganha 10 pontos (cravada). Se for 2x0, ganha 7 pontos (acertou o vencedor e o placar de um time).',
    dica: 'Dica: palpites são organizados por fase (Grupos, Oitavas, Quartas...) e por grupo (A-L). Use os filtros para navegar.',
  },
  {
    titulo: 'Sistema de Pontuação',
    icone: Star,
    corIcone: 'text-yellow-500',
    descricao: 'Cada palpite pode render de 0 a 10 pontos. O sistema avalia se você acertou o vencedor, o placar exato ou parcial.',
    exemplo: 'Jogo: França 3x1 Alemanha\n\n10 pts - Palpite: 3x1 (placar exato!)\n 7 pts - Palpite: 3x0 (vencedor + placar de 1 time)\n 5 pts - Palpite: 2x0 (só o vencedor)\n 2 pts - Palpite: 1x2 (placar de 1 time, resultado errado)\n 0 pts - Palpite: 0x0 (errou tudo)',
    dica: 'Dica: jogos decididos nos penaltis contam como empate para fins de palpite.',
  },
  {
    titulo: 'Ranking',
    icone: Trophy,
    corIcone: 'text-primary',
    rota: '/ranking',
    descricao: 'O ranking mostra a classificação geral de todos os participantes em tempo real. A posição é atualizada automaticamente a cada jogo encerrado.',
    exemplo: 'Exemplo: se você está em 3º com 85 pontos e o 2º lugar tem 87, uma cravada (10 pts) no próximo jogo pode te levar à liderança!',
    dica: 'Dica: em caso de empate, o desempate usa 7 critérios: total de pontos, cravadas (10pts), palpites de 7pts, 5pts, 2pts, assiduidade e acerto do campeão.',
  },
  {
    titulo: 'Palpite Bônus',
    icone: Award,
    corIcone: 'text-purple-500',
    rota: '/bonus',
    descricao: 'Antes da Copa começar, você escolhe quem será o campeão e o vice. Se acertar o campeão, ganha +20 pontos. Se acertar o vice, ganha +10 pontos.',
    exemplo: 'Exemplo: se você escolheu Brasil como campeão e Argentina como vice, e o resultado final for Brasil campeão e França vice, você ganha +20 pontos pelo campeão.',
    dica: 'Dica: o palpite bônus é feito apenas uma vez, antes do início da Copa, e não pode ser alterado depois.',
  },
  {
    titulo: 'Resultados Ao Vivo',
    icone: Tv,
    corIcone: 'text-green-500',
    rota: '/resultados',
    descricao: 'Acompanhe os resultados dos jogos em tempo real. Veja os placares atualizados, status dos jogos (agendado, ao vivo, encerrado) e compare com seus palpites.',
    exemplo: 'Exemplo: durante um jogo, a tela mostra "AO VIVO" com o placar atualizado. Após o término, seus pontos são calculados automaticamente.',
    dica: 'Dica: os resultados são sincronizados automaticamente. Não precisa atualizar a página.',
  },
  {
    titulo: 'Mural',
    icone: MessageCircle,
    corIcone: 'text-green-600',
    rota: '/mural',
    descricao: 'O mural é o chat do bolão. Converse com os outros participantes, comemore acertos, provoque os amigos e acompanhe a animação do grupo.',
    exemplo: 'Exemplo: "Cravei o 2x1! Quem mais acertou?" — Use o mural para interagir com o grupo durante e após os jogos.',
    dica: 'Dica: as mensagens são visíveis para todos os participantes do bolão.',
  },
  {
    titulo: 'Cara a Cara',
    icone: Swords,
    corIcone: 'text-indigo-500',
    rota: '/cara-a-cara',
    descricao: 'Compare seu desempenho diretamente com qualquer outro participante. Veja quem tem mais pontos, mais cravadas e mais acertos em um confronto direto.',
    exemplo: 'Exemplo: você vs. João — Pontos: 95x87. Cravadas: 3x1. Acertos de vencedor: 15x12. Um raio-X completo do duelo!',
    dica: 'Dica: ótimo para rivalidades saudáveis entre colegas.',
  },
  {
    titulo: 'Conquistas',
    icone: Award,
    corIcone: 'text-amber-500',
    rota: '/conquistas',
    descricao: 'Desbloqueie conquistas especiais conforme você joga. São medalhas que reconhecem feitos marcantes no bolão.',
    exemplo: 'Conquistas disponíveis:\n- Cravada: acertar o placar exato de um jogo\n- Vidente: fazer 3 cravadas\n- Pe Quente: acertar o vencedor 5 vezes seguidas',
    dica: 'Dica: as conquistas são concedidas automaticamente. Continue palpitando para desbloquear todas!',
  },
  {
    titulo: 'Destaques',
    icone: Star,
    corIcone: 'text-orange-500',
    rota: '/destaques',
    descricao: 'Veja os melhores momentos do bolão: quem fez mais cravadas, quem tem a maior sequência de acertos, e os melhores palpites de cada rodada.',
    exemplo: 'Exemplo: "Destaque da rodada: Maria — 3 cravadas seguidas!" — Os destaques são atualizados após cada rodada.',
    dica: 'Dica: apareça nos destaques mantendo uma boa sequência de acertos.',
  },
  {
    titulo: 'Bolões',
    icone: Users,
    corIcone: 'text-teal-500',
    rota: '/boloes',
    descricao: 'Participe de bolões criados pelo organizador. Cada bolão tem seu próprio grupo de participantes, valor de inscrição e regras de premiação.',
    exemplo: 'Exemplo: o organizador cria o bolão "Copa 2026" com inscrição de R$ 50. Você entra usando o código de convite e começa a palpitar.',
    dica: 'Dica: peça o código de entrada ao organizador e insira na tela de Bolões para participar.',
  },
  {
    titulo: 'Perfil',
    icone: User,
    corIcone: 'text-gray-500',
    rota: '/perfil',
    descricao: 'Gerencie seu perfil: altere seu apelido (nickname), que é como os outros participantes veem você no ranking e no mural.',
    exemplo: 'Exemplo: seu nickname "joao_silva" aparece no ranking, no mural e nas comparações. Escolha algo que os amigos reconheçam!',
    dica: 'Dica: o nickname deve ter pelo menos 3 caracteres.',
  },
  {
    titulo: 'Tudo pronto!',
    icone: Sparkles,
    corIcone: 'text-primary',
    descricao: 'Você já conhece todas as funcionalidades do Bolão Copa 2026. Agora é hora de fazer seus palpites e disputar o ranking!',
    exemplo: 'Recapitulando:\n1. Faça seus palpites antes de cada jogo\n2. Acompanhe o ranking em tempo real\n3. Escolha seu campeão no Palpite Bonus\n4. Converse no Mural\n5. Desbloqueie conquistas\n6. Divirta-se!',
    dica: 'Dica: você pode acessar este tour novamente pelo Manual de Utilização, disponível no menu.',
  },
]

const TOUR_KEY = 'bolao_tour_visto'

export default function Tour({ forcarExibicao, onFechar }) {
  const [visivel, setVisivel] = useState(false)
  const [passo, setPasso] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (forcarExibicao) {
      setVisivel(true)
      setPasso(0)
      return
    }
    const visto = localStorage.getItem(TOUR_KEY)
    if (!visto) setVisivel(true)
  }, [forcarExibicao])

  function fechar() {
    setVisivel(false)
    localStorage.setItem(TOUR_KEY, 'true')
    if (onFechar) onFechar()
  }

  function proximo() {
    if (passo < PASSOS.length - 1) {
      setPasso(passo + 1)
    } else {
      fechar()
    }
  }

  function anterior() {
    if (passo > 0) setPasso(passo - 1)
  }

  function irParaRota() {
    const rota = PASSOS[passo].rota
    if (rota) {
      fechar()
      navigate(rota)
    }
  }

  if (!visivel) return null

  const atual = PASSOS[passo]
  const Icone = atual.icone
  const isUltimo = passo === PASSOS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{passo + 1} / {PASSOS.length}</span>
            </div>
            <button
              onClick={fechar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="text-center mb-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gray-100 dark:bg-gray-700 ${atual.corIcone}`}>
              <Icone size={32} />
            </div>
            <h3 className="text-xl font-bold">{atual.titulo}</h3>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            {atual.descricao}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Exemplo</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">{atual.exemplo}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200">{atual.dica}</p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {PASSOS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-colors ${
                  i <= passo ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={anterior}
              disabled={passo === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <div className="flex gap-2">
              {atual.rota && (
                <button
                  onClick={irParaRota}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Ir para a tela
                </button>
              )}
              <button
                onClick={proximo}
                className="flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {isUltimo ? 'Começar!' : 'Próximo'}
                {!isUltimo && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function resetarTour() {
  localStorage.removeItem(TOUR_KEY)
}
