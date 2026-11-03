// @ts-ignore -- bun's built-in test runner; its type package is not installed in this project
import { describe, expect, test } from 'bun:test'
import { createSession, passwordMatches, sessionSecret, verifySession, SESSION_MAX_AGE_S } from '../src/lib/admin-session'
import { describeGaError } from '../src/lib/ga'

const SECRET = 'test-secret-value'
const NOW = Date.UTC(2026, 10, 3, 12, 0, 0)

describe('passwordMatches', () => {
  test('accepts only the exact password', () => {
    expect(passwordMatches('abc', 'abc')).toBe(true)
    expect(passwordMatches('abd', 'abc')).toBe(false)
    expect(passwordMatches('abc ', 'abc')).toBe(false)
  })
  test('rejects when nothing is configured or the input is not a string', () => {
    expect(passwordMatches('abc', undefined)).toBe(false)
    expect(passwordMatches('abc', '')).toBe(false)
    expect(passwordMatches(undefined, 'abc')).toBe(false)
    expect(passwordMatches(123, 'abc')).toBe(false)
  })
})

describe('sessions', () => {
  test('a fresh session verifies', () => {
    expect(verifySession(createSession(SECRET, NOW), SECRET, NOW + 1000)).toBe(true)
  })
  test('the token does not contain the secret', () => {
    expect(createSession(SECRET, NOW)).not.toContain(SECRET)
  })
  test('expires after the max age', () => {
    const t = createSession(SECRET, NOW)
    expect(verifySession(t, SECRET, NOW + (SESSION_MAX_AGE_S - 5) * 1000)).toBe(true)
    expect(verifySession(t, SECRET, NOW + (SESSION_MAX_AGE_S + 5) * 1000)).toBe(false)
  })
  test('a different secret (changed password) invalidates it', () => {
    expect(verifySession(createSession(SECRET, NOW), 'another-secret', NOW)).toBe(false)
  })
  test('rejects a tampered payload or signature', () => {
    const [payload, sig] = createSession(SECRET, NOW).split('.')
    const forged = Buffer.from(JSON.stringify({ exp: 9999999999 })).toString('base64').replace(/=/g, '')
    expect(verifySession(`${forged}.${sig}`, SECRET, NOW)).toBe(false)
    expect(verifySession(`${payload}.${sig.slice(0, -2)}xx`, SECRET, NOW)).toBe(false)
  })
  test('rejects malformed tokens, including the old raw-password cookie', () => {
    for (const t of [undefined, '', 'a', 'a.b.c', '.', 'a.', '.b', SECRET]) expect(verifySession(t, SECRET, NOW)).toBe(false)
    expect(verifySession(createSession(SECRET, NOW), undefined, NOW)).toBe(false)
  })
})

describe('sessionSecret', () => {
  test('prefers ADMIN_SESSION_SECRET, falls back to the password', () => {
    expect(sessionSecret({ ADMIN_SESSION_SECRET: 's', ADMIN_PASSWORD: 'p' })).toBe('s')
    expect(sessionSecret({ ADMIN_PASSWORD: 'p' })).toBe('p')
    expect(sessionSecret({})).toBeUndefined()
  })
})

describe('describeGaError', () => {
  test('API switched off gets an enable message and the activation link', () => {
    const body = { error: { message: 'API has not been used', details: [{ reason: 'SERVICE_DISABLED', metadata: { activationUrl: 'https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=1' } }] } }
    const r = describeGaError(403, body)
    expect(r.message).toContain('switched off')
    expect(r.message).toContain('console.developers.google.com')
    expect(r.message).not.toContain('Viewer')
    expect(r.status).toBe(503)
  })
  test('ignores an activation link that is not a Google console URL', () => {
    const body = { error: { details: [{ reason: 'SERVICE_DISABLED', metadata: { activationUrl: 'https://evil.example/x' } }] } }
    expect(describeGaError(403, body).message).not.toContain('evil.example')
  })
  test('other 403s mention the Viewer role', () => {
    const r = describeGaError(403, { error: { message: 'User does not have sufficient permissions' } })
    expect(r.message).toContain('Viewer')
    expect(r.status).toBe(403)
  })
  test('other failures are passed through as 502', () => {
    expect(describeGaError(500, { error: { message: 'boom' } })).toEqual({ message: 'Google Analytics: boom', status: 502 })
    expect(describeGaError(500, null).status).toBe(502)
  })
})
