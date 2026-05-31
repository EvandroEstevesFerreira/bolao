import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Layout from '../components/Layout'

export default function Regulamento() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A3942]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={24} className="text-primary" />
              Regulamento
            </h2>
          </div>
        </div>

        <div className="card prose prose-sm max-w-none">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">1. Quem pode participar</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Qualquer pessoa que receber o convite do organizador e completar o cadastro (CPF + nickname).
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">2. Valor da inscrição</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Valor único de inscrição definido pelo organizador do bolão. O acesso pode ser condicionado à confirmação do pagamento pelo administrador.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">3. Como pontuar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-[#2A3942]">
                  <th className="py-2 text-left">Pontos</th>
                  <th className="py-2 text-left">Critério</th>
                  <th className="py-2 text-left">Exemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-[#2A3942]">
                  <td className="py-2 font-bold text-yellow-600">10</td>
                  <td>Acertou o vencedor <strong>e</strong> o placar exato</td>
                  <td className="text-gray-500">Jogo: 3×1, Palpite: 3×1</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-[#2A3942]">
                  <td className="py-2 font-bold text-green-600">7</td>
                  <td>Acertou o vencedor <strong>e</strong> o placar de um time</td>
                  <td className="text-gray-500">Jogo: 3×1, Palpite: 3×0</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-[#2A3942]">
                  <td className="py-2 font-bold text-blue-600">5</td>
                  <td>Acertou apenas o vencedor (ou empate)</td>
                  <td className="text-gray-500">Jogo: 3×1, Palpite: 2×0</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-[#2A3942]">
                  <td className="py-2 font-bold text-orange-600">2</td>
                  <td>Acertou o placar de um time, mas errou o resultado</td>
                  <td className="text-gray-500">Jogo: 3×1, Palpite: 1×2</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-gray-400">0</td>
                  <td>Não palpitou ou errou tudo</td>
                  <td className="text-gray-500">Jogo: 3×1, Palpite: 0×0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">4. Bônus</h3>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Campeão:</strong> +20 pontos · <strong>Vice:</strong> +10 pontos. Os palpites de campeão e vice são feitos antes da abertura da Copa e revelados ao final do torneio.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">5. Regra dos pênaltis</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Vale o resultado do tempo normal + prorrogação. Jogo decidido nos pênaltis conta como <strong>empate</strong> para fins de palpite.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">6. Prazo do palpite</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Cada palpite pode ser editado até <strong>10 minutos antes</strong> do início do jogo. Depois disso, fica travado e imutável. Quem não palpitar leva 0 naquele jogo.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">7. Sigilo</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Ninguém vê o palpite dos outros participantes antes da trava (10 min antes do jogo). Após a trava, todos os palpites ficam visíveis.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">8. Critérios de desempate</h3>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Maior total de pontos</li>
            <li>Maior número de cravadas (10 pts)</li>
            <li>Maior número de palpites de 7 pts</li>
            <li>Maior número de palpites de 5 pts</li>
            <li>Maior número de palpites de 2 pts</li>
            <li>Maior número de jogos palpitados (assiduidade)</li>
            <li>Acerto do palpite de campeão (bônus)</li>
            <li>Empate persistente: divisão proporcional do prêmio</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-6">9. Premiação</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Os percentuais de premiação por posição são definidos pelo organizador (ex.: 1º = 60%, 2º = 30%, 3º = 10%). O sistema calcula e exibe o valor estimado com base na arrecadação.
          </p>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              ⚠️ Aviso de isenção: Este sistema é ferramenta de acompanhamento e cálculo. A arrecadação e a entrega de qualquer prêmio são responsabilidade exclusiva do organizador/grupo. O sistema não processa nem retém valores.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
