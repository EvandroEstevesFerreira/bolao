import { describe, it, expect } from 'vitest'
import { calcularPontos, getCorPontuacao, getLabelPontuacao } from '../lib/pontuacao'

describe('calcularPontos', () => {
  it('retorna 10 para placar exato (cravada)', () => {
    expect(calcularPontos(2, 1, 2, 1)).toBe(10)
    expect(calcularPontos(0, 0, 0, 0)).toBe(10)
    expect(calcularPontos(3, 3, 3, 3)).toBe(10)
  })

  it('retorna 7 para vencedor + um placar correto', () => {
    expect(calcularPontos(2, 1, 2, 0)).toBe(7)
    expect(calcularPontos(3, 1, 2, 1)).toBe(7)
    expect(calcularPontos(0, 2, 0, 3)).toBe(7)
  })

  it('retorna 5 para vencedor correto sem placar', () => {
    expect(calcularPontos(2, 0, 3, 1)).toBe(5)
    expect(calcularPontos(0, 1, 0, 3)).toBe(7)
    expect(calcularPontos(1, 1, 0, 0)).toBe(5)
  })

  it('retorna 2 para um placar correto com vencedor errado', () => {
    expect(calcularPontos(2, 1, 2, 3)).toBe(2)
    expect(calcularPontos(1, 0, 1, 2)).toBe(2)
    expect(calcularPontos(3, 2, 0, 2)).toBe(2)
  })

  it('retorna 0 quando erra tudo', () => {
    expect(calcularPontos(2, 0, 0, 1)).toBe(0)
    expect(calcularPontos(1, 1, 2, 0)).toBe(0)
    expect(calcularPontos(0, 3, 4, 0)).toBe(0)
  })

  it('retorna 0 quando algum valor é null', () => {
    expect(calcularPontos(null, 1, 2, 1)).toBe(0)
    expect(calcularPontos(1, null, 2, 1)).toBe(0)
    expect(calcularPontos(1, 1, null, 1)).toBe(0)
    expect(calcularPontos(1, 1, 2, null)).toBe(0)
  })

  it('empate real x empate palpite com placares diferentes = 5', () => {
    expect(calcularPontos(2, 2, 1, 1)).toBe(5)
  })

  it('empate real x palpite empate com um acerto = 7', () => {
    expect(calcularPontos(2, 2, 2, 2)).toBe(10)
    expect(calcularPontos(2, 2, 3, 2)).toBe(2)
  })

  it('goleada correta = 10', () => {
    expect(calcularPontos(5, 0, 5, 0)).toBe(10)
  })
})

describe('getCorPontuacao', () => {
  it('retorna a cor correta para cada pontuação', () => {
    expect(getCorPontuacao(10)).toBe('text-yellow-500')
    expect(getCorPontuacao(7)).toBe('text-green-500')
    expect(getCorPontuacao(5)).toBe('text-blue-500')
    expect(getCorPontuacao(2)).toBe('text-orange-500')
    expect(getCorPontuacao(0)).toBe('text-gray-400')
  })
})

describe('getLabelPontuacao', () => {
  it('retorna o label correto', () => {
    expect(getLabelPontuacao(10)).toBe('Cravada!')
    expect(getLabelPontuacao(7)).toBe('Quase lá!')
    expect(getLabelPontuacao(0)).toBe('Não pontuou')
  })
})
