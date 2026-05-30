export function calcularPontos(placarRealCasa, placarRealFora, palpiteCasa, palpiteFora) {
  if (
    placarRealCasa == null || placarRealFora == null ||
    palpiteCasa == null || palpiteFora == null
  ) {
    return 0
  }

  const acertouPlacarCasa = palpiteCasa === placarRealCasa
  const acertouPlacarFora = palpiteFora === placarRealFora
  const acertouPlacarExato = acertouPlacarCasa && acertouPlacarFora

  const resultadoReal = Math.sign(placarRealCasa - placarRealFora)
  const resultadoPalpite = Math.sign(palpiteCasa - palpiteFora)
  const acertouVencedor = resultadoReal === resultadoPalpite

  if (acertouVencedor && acertouPlacarExato) return 10
  if (acertouVencedor && (acertouPlacarCasa || acertouPlacarFora)) return 7
  if (acertouVencedor) return 5
  if (acertouPlacarCasa || acertouPlacarFora) return 2
  return 0
}

export function getCorPontuacao(pontos) {
  switch (pontos) {
    case 10: return 'text-yellow-500'
    case 7: return 'text-green-500'
    case 5: return 'text-blue-500'
    case 2: return 'text-orange-500'
    default: return 'text-gray-400'
  }
}

export function getLabelPontuacao(pontos) {
  switch (pontos) {
    case 10: return 'Cravada!'
    case 7: return 'Quase lá!'
    case 5: return 'Acertou o resultado'
    case 2: return 'Acertou um placar'
    default: return 'Não pontuou'
  }
}
