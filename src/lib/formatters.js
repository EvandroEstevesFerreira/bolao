import { format, parseISO, differenceInMinutes, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatarDataHora(dataISO) {
  if (!dataISO) return ''
  const data = typeof dataISO === 'string' ? parseISO(dataISO) : dataISO
  return format(data, "dd/MM · HH:mm", { locale: ptBR })
}

export function formatarDataCompleta(dataISO) {
  if (!dataISO) return ''
  const data = typeof dataISO === 'string' ? parseISO(dataISO) : dataISO
  return format(data, "EEEE, dd 'de' MMMM · HH:mm", { locale: ptBR })
}

export function palpiteTravado(dataHoraJogo) {
  if (!dataHoraJogo) return false
  const jogo = typeof dataHoraJogo === 'string' ? parseISO(dataHoraJogo) : dataHoraJogo
  return differenceInMinutes(jogo, new Date()) <= 10
}

export function jogoJaComecou(dataHoraJogo) {
  if (!dataHoraJogo) return false
  const jogo = typeof dataHoraJogo === 'string' ? parseISO(dataHoraJogo) : dataHoraJogo
  return isBefore(jogo, new Date())
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0)
}
