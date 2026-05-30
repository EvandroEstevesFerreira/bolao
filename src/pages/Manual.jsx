import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, ClipboardList, Trophy, MessageCircle,
  User, Star, Award, Swords, Tv, Users, ChevronDown, ChevronUp,
  HelpCircle, Sparkles,
} from 'lucide-react'
import Layout from '../components/Layout'
import Tour, { resetarTour } from '../components/Tour'

const secoes = [
  {
    id: 'inicio',
    titulo: 'Tela Inicial',
    icone: Sparkles,
    cor: 'text-yellow-500',
    conteudo: [
      {
        subtitulo: 'O que mostra?',
        texto: 'A tela inicial é seu painel pessoal. Mostra sua posição no ranking, total de pontos, quantidade de palpites feitos e os próximos jogos da Copa.',
      },
      {
        subtitulo: 'Cards de estatísticas',
        texto: 'Os três cards no topo mostram: seus pontos totais, quantos palpites você já fez, e o total de jogos da Copa (104 jogos no total).',
      },
      {
        subtitulo: 'Próximos Jogos',
        texto: 'Lista os 5 próximos jogos com data, hora e seleções. Toque em qualquer jogo para ir direto à tela de palpites.',
      },
      {
        subtitulo: 'Atalhos',
        texto: 'Na parte inferior da tela inicial, há atalhos rápidos para Destaques, Conquistas, Cara a Cara, Palpite Bônus e Regulamento.',
      },
    ],
  },
  {
    id: 'palpites',
    titulo: 'Como Palpitar',
    icone: ClipboardList,
    cor: 'text-blue-500',
    conteudo: [
      {
        subtitulo: 'Fazendo um palpite',
        texto: 'Na tela de Palpites, localize o jogo desejado e digite o placar que você acredita. Toque em "Salvar" para confirmar. Você verá uma confirmação verde.',
      },
      {
        subtitulo: 'Editando um palpite',
        texto: 'Você pode alterar seu palpite quantas vezes quiser até 10 minutos antes do início do jogo. Depois disso, o palpite fica travado e imutável.',
      },
      {
        subtitulo: 'Filtros',
        texto: 'Use os botões no topo para filtrar por fase (Grupos, Oitavas, Quartas, Semifinal, Final) e por grupo (A até L). Facilita encontrar os jogos que você quer palpitar.',
      },
      {
        subtitulo: 'Palpite não feito',
        texto: 'Se você não palpitar em um jogo antes do prazo, recebe 0 pontos automaticamente. Fique atento aos horários!',
      },
      {
        subtitulo: 'Exemplo prático',
        texto: 'Jogo: Brasil vs Argentina, 15/06 às 16h.\nVocê palpita 2x1. O jogo termina 2x1.\nResultado: CRAVADA! Você ganha 10 pontos.',
      },
    ],
  },
  {
    id: 'pontuacao',
    titulo: 'Sistema de Pontuação',
    icone: Star,
    cor: 'text-yellow-500',
    conteudo: [
      {
        subtitulo: 'Tabela de pontos',
        texto: '10 pontos — Acertou o placar exato (cravada)\n 7 pontos — Acertou o vencedor e o placar de um time\n 5 pontos — Acertou apenas o vencedor (ou empate)\n 2 pontos — Acertou o placar de um time, mas errou o resultado\n 0 pontos — Errou tudo ou não palpitou',
      },
      {
        subtitulo: 'Exemplos detalhados',
        texto: 'Resultado real: França 3x1 Alemanha\n\nPalpite 3x1 = 10 pts (placar exato!)\nPalpite 3x0 = 7 pts (acertou vencedor + gols da França)\nPalpite 2x0 = 5 pts (acertou que a França vencia)\nPalpite 1x2 = 2 pts (acertou 1 gol da Alemanha)\nPalpite 0x0 = 0 pts (errou tudo)',
      },
      {
        subtitulo: 'Regra dos penaltis',
        texto: 'Jogos decididos nos penaltis contam como empate para fins de palpite. Apenas o placar do tempo regulamentar + prorrogação é considerado.',
      },
      {
        subtitulo: 'Bonus de Campeão',
        texto: 'Acertar o campeão vale +20 pontos. Acertar o vice vale +10 pontos. Esses pontos bonus são somados ao final do torneio.',
      },
    ],
  },
  {
    id: 'ranking',
    titulo: 'Ranking',
    icone: Trophy,
    cor: 'text-primary',
    conteudo: [
      {
        subtitulo: 'Como funciona',
        texto: 'O ranking mostra todos os participantes ordenados por pontuação total. É atualizado automaticamente após cada jogo ser encerrado.',
      },
      {
        subtitulo: 'Critérios de desempate',
        texto: 'Em caso de empate em pontos, o desempate segue esta ordem:\n1. Maior total de pontos\n2. Mais cravadas (10 pts)\n3. Mais palpites de 7 pts\n4. Mais palpites de 5 pts\n5. Mais palpites de 2 pts\n6. Mais jogos palpitados\n7. Acerto do campeão',
      },
      {
        subtitulo: 'Premiação',
        texto: 'O organizador define os percentuais de premiação (ex: 1º = 60%, 2º = 30%, 3º = 10%). O valor estimado é calculado automaticamente com base na arrecadação.',
      },
    ],
  },
  {
    id: 'bonus',
    titulo: 'Palpite Bônus',
    icone: Award,
    cor: 'text-purple-500',
    conteudo: [
      {
        subtitulo: 'O que é',
        texto: 'Antes da Copa começar, você escolhe qual seleção será a campeã e qual será a vice-campeã. Esses palpites ficam lacrados até o final do torneio.',
      },
      {
        subtitulo: 'Pontuação',
        texto: 'Campeão correto: +20 pontos\nVice correto: +10 pontos\nOs pontos são adicionados ao seu total após a final.',
      },
      {
        subtitulo: 'Regras',
        texto: 'O palpite bônus só pode ser feito antes do primeiro jogo da Copa. Não pode ser alterado após a trava. Os palpites de todos ficam ocultos até o final do torneio.',
      },
    ],
  },
  {
    id: 'resultados',
    titulo: 'Resultados Ao Vivo',
    icone: Tv,
    cor: 'text-green-500',
    conteudo: [
      {
        subtitulo: 'Acompanhamento',
        texto: 'A tela de resultados mostra todos os jogos com seus status: Agendado (azul), Ao Vivo (verde pulsante), Encerrado (cinza). Os placares são atualizados automaticamente.',
      },
      {
        subtitulo: 'Comparação com palpites',
        texto: 'Após o jogo, você pode ver seu palpite ao lado do resultado real e quantos pontos ganhou em cada partida.',
      },
    ],
  },
  {
    id: 'mural',
    titulo: 'Mural (Chat)',
    icone: MessageCircle,
    cor: 'text-green-600',
    conteudo: [
      {
        subtitulo: 'Como usar',
        texto: 'O mural é um chat em tempo real para os participantes do bolão. Digite sua mensagem e toque em enviar. As mensagens aparecem instantaneamente para todos.',
      },
      {
        subtitulo: 'Boas práticas',
        texto: 'Use o mural para comentar jogos, comemorar acertos, interagir com os amigos. As mensagens são visíveis para todos os participantes do bolão.',
      },
    ],
  },
  {
    id: 'cara-a-cara',
    titulo: 'Cara a Cara',
    icone: Swords,
    cor: 'text-indigo-500',
    conteudo: [
      {
        subtitulo: 'Confronto direto',
        texto: 'Escolha qualquer participante para comparar seu desempenho diretamente: pontos totais, número de cravadas, acertos de vencedor e mais.',
      },
      {
        subtitulo: 'Exemplo',
        texto: 'Você vs. Maria:\nPontos: 95 x 87 (você lidera!)\nCravadas: 3 x 4 (ela tem mais cravadas)\nVitórias: 15 x 12\n\nUm raio-X completo para rivalidades saudáveis.',
      },
    ],
  },
  {
    id: 'conquistas',
    titulo: 'Conquistas',
    icone: Award,
    cor: 'text-amber-500',
    conteudo: [
      {
        subtitulo: 'Medalhas',
        texto: 'Desbloqueie conquistas especiais conforme você joga:\n\nCravada — Acertou o placar exato de um jogo\nVidente — Fez 3 cravadas ao longo do bolão\nPé Quente — Acertou o vencedor 5 vezes seguidas',
      },
      {
        subtitulo: 'Como ganhar',
        texto: 'As conquistas são concedidas automaticamente pelo sistema quando você atinge os critérios. Não precisa solicitar — elas aparecem na sua tela de conquistas.',
      },
    ],
  },
  {
    id: 'boloes',
    titulo: 'Bolões',
    icone: Users,
    cor: 'text-teal-500',
    conteudo: [
      {
        subtitulo: 'Entrando em um bolão',
        texto: 'Na tela de Bolões, insira o código de entrada fornecido pelo organizador e toque em "Entrar". Você será adicionado ao grupo e poderá começar a palpitar.',
      },
      {
        subtitulo: 'Pagamento',
        texto: 'O valor da inscrição é definido pelo organizador. O pagamento é feito fora do app (PIX, dinheiro, etc.) e o organizador confirma no sistema.',
      },
    ],
  },
  {
    id: 'perfil',
    titulo: 'Perfil',
    icone: User,
    cor: 'text-gray-500',
    conteudo: [
      {
        subtitulo: 'Editando o perfil',
        texto: 'Toque em "Editar perfil" para alterar seu apelido (nickname). O nickname é como os outros participantes veem você no ranking, mural e comparações.',
      },
      {
        subtitulo: 'Informações',
        texto: 'A tela mostra seu nome, apelido e data de cadastro. Seu CPF nunca é visível para outros participantes — apenas o nickname aparece.',
      },
    ],
  },
  {
    id: 'dicas',
    titulo: 'Dicas Gerais',
    icone: HelpCircle,
    cor: 'text-primary',
    conteudo: [
      {
        subtitulo: 'Tema claro/escuro',
        texto: 'Toque no ícone de sol/lua no canto superior direito do header para alternar entre tema claro e escuro.',
      },
      {
        subtitulo: 'Navegação',
        texto: 'Use a barra inferior para acessar as 5 telas principais: Início, Palpites, Ranking, Mural e Perfil. O menu superior tem mais opções: Resultados, Destaques, Conquistas, etc.',
      },
      {
        subtitulo: 'No celular',
        texto: 'No celular, toque no ícone de menu (3 linhas) no header para ver todas as opções extras. Você também pode instalar o app na tela inicial do celular (PWA).',
      },
      {
        subtitulo: 'Sigilo dos palpites',
        texto: 'Ninguém vê o palpite dos outros antes da trava (10 min antes do jogo). Após a trava, todos os palpites ficam visíveis. Isso garante que ninguém copia o palpite de outro.',
      },
      {
        subtitulo: 'Aviso importante',
        texto: 'Este sistema é ferramenta de acompanhamento e cálculo. A arrecadação e a entrega de qualquer prêmio são responsabilidade exclusiva do organizador/grupo.',
      },
    ],
  },
]

function SecaoManual({ secao, aberta, onToggle }) {
  const Icone = secao.icone

  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${secao.cor}`}>
            <Icone size={20} />
          </div>
          <h3 className="font-bold">{secao.titulo}</h3>
        </div>
        {aberta ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {aberta && (
        <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {secao.conteudo.map((item, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm text-primary mb-1">{item.subtitulo}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Manual() {
  const [abertas, setAbertas] = useState(new Set(['inicio']))
  const [tourIniciado, setTourIniciado] = useState(false)

  function toggleSecao(id) {
    setAbertas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandirTodas() {
    setAbertas(new Set(secoes.map(s => s.id)))
  }

  function recolherTodas() {
    setAbertas(new Set())
  }

  function iniciarTour() {
    resetarTour()
    setTourIniciado(true)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={24} className="text-primary" />
              Manual de Utilização
            </h2>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Tour Interativo</h3>
              <p className="text-white/80 text-sm mt-1">
                Novo por aqui? Faça o tour guiado e conheça cada recurso do app com exemplos práticos.
              </p>
            </div>
            <button
              onClick={iniciarTour}
              className="px-4 py-2 bg-white text-primary font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors whitespace-nowrap ml-4"
            >
              Iniciar Tour
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={expandirTodas} className="text-xs text-primary hover:underline">
            Expandir todas
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={recolherTodas} className="text-xs text-primary hover:underline">
            Recolher todas
          </button>
        </div>

        {secoes.map(secao => (
          <SecaoManual
            key={secao.id}
            secao={secao}
            aberta={abertas.has(secao.id)}
            onToggle={() => toggleSecao(secao.id)}
          />
        ))}

        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-center">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Dúvidas? Fale com o organizador do bolão pelo Mural.
          </p>
        </div>
      </div>

      {tourIniciado && (
        <Tour forcarExibicao onFechar={() => setTourIniciado(false)} />
      )}
    </Layout>
  )
}
