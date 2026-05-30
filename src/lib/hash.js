const SALT = 'bolao-sistenge-2026'

export async function hashPin(pin) {
  const data = new TextEncoder().encode(SALT + pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verificarPin(pin, hash) {
  const pinHash = await hashPin(pin)
  return pinHash === hash
}
