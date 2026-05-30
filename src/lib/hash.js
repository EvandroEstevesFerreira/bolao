const SALT = 'bolao-copa-2026'
const SALT_LEGACY = 'bolao-sistenge-2026'

export async function hashPin(pin) {
  const data = new TextEncoder().encode(SALT + pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPinLegacy(pin) {
  const data = new TextEncoder().encode(SALT_LEGACY + pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verificarPin(pin, hash) {
  const pinHash = await hashPin(pin)
  if (pinHash === hash) return true
  const legacyHash = await hashPinLegacy(pin)
  return legacyHash === hash
}
