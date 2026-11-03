// @ts-ignore -- bun's built-in test runner; its type package is not installed in this project
import { describe, expect, test } from 'bun:test'
import { filtersSchema, hourList, previousRange } from '../src/lib/analytics'
import { buildInsights } from '../src/lib/analytics-insights'
import type { DashboardInputs } from '../src/lib/analytics-types'

const base = (over: Partial<DashboardInputs> = {}): DashboardInputs => ({
  filters: { from: '2026-10-01', to: '2026-10-28', hourFrom: 0, hourTo: 23, platform: 'all' },
  totals: { activeUsers: 50, newUsers: 20, sessions: 80, prevActiveUsers: 50, prevNewUsers: 20, prevSessions: 80 },
  daily: [],
  hourly: [],
  funnel: [
    { step: 'First open', all: 200, android: 120, ios: 80 },
    { step: 'Login', all: 180, android: 108, ios: 72 },
    { step: 'Scan started', all: 160, android: 96, ios: 64 },
    { step: 'Scan completed', all: 150, android: 90, ios: 60 },
    { step: 'Cleanup completed', all: 140, android: 84, ios: 56 },
  ],
  events: {},
  features: [],
  ...over,
})

describe('hourList', () => {
  test('whole day means no filter', () => expect(hourList(0, 23)).toBeNull())
  test('single hour', () => expect(hourList(9, 9)).toEqual(['09']))
  test('window inside a day', () => expect(hourList(8, 10)).toEqual(['08', '09', '10']))
  test('window that wraps past midnight', () => expect(hourList(22, 1)).toEqual(['22', '23', '00', '01']))
})

describe('previousRange', () => {
  test('is the equal-length period just before', () => {
    expect(previousRange({ from: '2026-10-08', to: '2026-10-14' })).toEqual({ from: '2026-10-01', to: '2026-10-07' })
  })
  test('a single day maps to the day before', () => {
    expect(previousRange({ from: '2026-10-08', to: '2026-10-08' })).toEqual({ from: '2026-10-07', to: '2026-10-07' })
  })
})

describe('filtersSchema', () => {
  const ok = { from: '2026-10-01', to: '2026-10-28' }
  test('applies defaults', () => {
    const r = filtersSchema.parse(ok)
    expect([r.hourFrom, r.hourTo, r.platform]).toEqual([0, 23, 'all'])
  })
  test('rejects reversed dates', () => expect(filtersSchema.safeParse({ from: '2026-10-28', to: '2026-10-01' }).success).toBe(false))
  test('rejects bad dates and hours', () => {
    expect(filtersSchema.safeParse({ from: 'x', to: '2026-10-01' }).success).toBe(false)
    expect(filtersSchema.safeParse({ ...ok, hourFrom: 24 }).success).toBe(false)
  })
  test('rejects ranges over a year and unknown platforms', () => {
    expect(filtersSchema.safeParse({ from: '2024-01-01', to: '2026-01-01' }).success).toBe(false)
    expect(filtersSchema.safeParse({ ...ok, platform: 'web' }).success).toBe(false)
  })
})

describe('buildInsights', () => {
  test('flags the biggest funnel loss with its fix', () => {
    const funnel = base().funnel.map((s, i) => (i >= 4 ? { ...s, all: 60, android: 30, ios: 30 } : s))
    const leak = buildInsights(base({ funnel })).find((i) => i.id === 'funnel-leak')
    expect(leak?.title).toContain('Cleanup completed')
    expect(leak?.severity).toBe('high')
  })
  test('no funnel advice when the sample is too small', () => {
    const funnel = base().funnel.map((s) => ({ ...s, all: Math.floor(s.all / 20) }))
    expect(buildInsights(base({ funnel })).some((i) => i.id === 'funnel-leak')).toBe(false)
  })
  test('reports a platform gap and names the weaker platform', () => {
    const funnel = base().funnel.map((s, i) => (i === 4 ? { ...s, android: 20, ios: 60 } : s))
    const gap = buildInsights(base({ funnel })).find((i) => i.id === 'platform-gap')
    expect(gap?.title).toStartWith('Android')
  })
  test('flags failing scans', () => {
    const events = { scan_started: { count: 100, users: 50 }, scan_completed: { count: 50, users: 40 }, scan_cancelled: { count: 20, users: 10 }, scan_failed: { count: 10, users: 5 } }
    const ids = buildInsights(base({ events })).map((i) => i.id)
    expect(ids).toContain('scan-exits')
  })
  test('flags a usage drop and sorts high severity first', () => {
    const out = buildInsights(base({ totals: { activeUsers: 20, newUsers: 5, sessions: 30, prevActiveUsers: 50, prevNewUsers: 20, prevSessions: 80 } }))
    expect(out[0].severity).toBe('high')
    expect(out.some((i) => i.id === 'usage-down')).toBe(true)
  })
  test('lists rare features', () => {
    const f = (n: string, users: number) => ({ feature: n, opens: users, users, closes: 0, avgSec: null, androidOpens: users, iosOpens: 0 })
    const out = buildInsights(base({ events: { feature_opened: { count: 500, users: 100 } }, features: [f('A', 1), f('B', 2), f('C', 3), f('D', 60)] }))
    expect(out.find((i) => i.id === 'rare-features')?.evidence).toContain('A, B, C')
  })
})
