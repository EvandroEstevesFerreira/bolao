export function validarCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cleaned[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(cleaned[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cleaned[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  return resto === parseInt(cleaned[10])
}

export function formatarCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function limparCPF(cpf) {
  return cpf.replace(/\D/g, '')
}
