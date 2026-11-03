import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Signed, expiring admin session tokens.
 *
 * The cookie holds `<payload>.<signature>` where the payload is the expiry time
 * and the signature is an HMAC-SHA256 of it. The password itself is never put
 * in the cookie, and changing the password (or ADMIN_SESSION_SECRET) signs every
 * existing session out. Pure functions only, so they can be unit tested.
 */

export const SESSION_COOKIE = 'admin_session'
/** Cookie name used before sessions were signed; it held the raw password. */
export const LEGACY_COOKIE = 'admin_token'
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const sign = (secret: string, payload: string) =>
  b64url(createHmac('sha256', secret).update(payload).digest())

/** The key sessions are signed with: a dedicated secret if set, otherwise the admin password. */
export function sessionSecret(env: Record<string, string | undefined> = process.env): string | undefined {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || undefined
}

/** Constant-time password check. Hashing first makes both sides the same length. */
export function passwordMatches(input: unknown, expected: string | undefined): boolean {
  if (!expected || typeof input !== 'string') return false
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export function createSession(secret: string, nowMs: number = Date.now()): string {
  const payload = b64url(JSON.stringify({ exp: Math.floor(nowMs / 1000) + SESSION_MAX_AGE_S }))
  return `${payload}.${sign(secret, payload)}`
}

export function verifySession(
  token: string | undefined,
  secret: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!token || !secret) return false
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false
  const [payload, signature] = parts

  const given = Buffer.from(signature)
  const expected = Buffer.from(sign(secret, payload))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as { exp?: unknown }
    return typeof exp === 'number' && exp > Math.floor(nowMs / 1000)
  } catch {
    return false
  }
}
