'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Area,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  type DailyPoint,
  type EventStats,
  type FeatureRow,
  type FunnelStep,
  type HourPoint,
  type Insight,
  type PlatformFilter,
  CORE_REACH,
  OCCASIONAL_REACH,
  tierOf,
} from '@/lib/analytics-types'

const SKY = '#5FA3FF'
const OCEAN = '#0056D2'
const RED = '#FF5252'
const AMBER = '#F5B544'
const GRID = 'rgba(255,255,255,0.08)'
const AXIS = 'rgba(255,255,255,0.45)'

const fInt = (n: number) => n.toLocaleString('en-US')
const fPct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`
const hh = (h: number) => String(h).padStart(2, '0')

export function Card({
  title,
  note,
  children,
  className,
}: {
  title: string
  note?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5', className)}>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      {note && <p className="mt-1 text-xs leading-relaxed text-white/45">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function StatTile({ label, value, previous, note }: { label: string; value: number | string; previous?: number; note?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-white">{typeof value === 'number' ? fInt(value) : value}</p>
      {note && <p className="mt-1 text-xs text-white/45">{note}</p>}
      {previous !== undefined && typeof value === 'number' && <Delta current={value} previous={previous} />}
    </div>
  )
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (!previous) return <p className="mt-1 text-xs text-white/35">No data in the previous period</p>
  const change = current / previous - 1
  const up = change >= 0
  return (
    <p className={cn('mt-1 text-xs tabular-nums', up ? 'text-emerald-400' : 'text-remove')}>
      {up ? '+' : '−'}
      {fPct(Math.abs(change))} <span className="text-white/35">vs previous period</span>
    </p>
  )
}

// ---------- recommendations ----------

const SEVERITY_STYLE: Record<Insight['severity'], { label: string; cls: string }> = {
  high: { label: 'High impact', cls: 'bg-remove/15 text-remove' },
  medium: { label: 'Medium', cls: 'bg-amber-400/15 text-amber-300' },
  low: { label: 'Worth doing', cls: 'bg-sky/15 text-sky' },
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return <p className="text-sm text-white/55">Nothing stands out for this selection. Widen the date range for a larger sample.</p>
  }
  return (
    <ol className="grid gap-3 lg:grid-cols-2">
      {insights.map((i) => (
        <li key={i.id} className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium', SEVERITY_STYLE[i.severity].cls)}>
            {SEVERITY_STYLE[i.severity].label}
          </span>
          <h4 className="mt-2 font-display text-sm font-semibold text-white">{i.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{i.evidence}</p>
          <p className="mt-2 text-xs leading-relaxed text-white/85">
            <span className="font-medium text-sky">Try this: </span>
            {i.action}
          </p>
        </li>
      ))}
    </ol>
  )
}

// ---------- funnel ----------

const pick = (s: FunnelStep, p: PlatformFilter) => (p === 'Android' ? s.android : p === 'iOS' ? s.ios : s.all)

export function FunnelPanel({ steps, platform }: { steps: FunnelStep[]; platform: PlatformFilter }) {
  const first = steps[0] ? pick(steps[0], platform) : 0
  const losses = steps.map((s, i) => {
    if (i === 0) return null
    const prev = pick(steps[i - 1], platform)
    return prev > 0 ? (prev - pick(s, platform)) / prev : null
  })
  const worst = losses.reduce<number>((w, l, i) => (l !== null && (w === -1 || l > (losses[w] ?? -1)) ? i : w), -1)

  if (first === 0) return <p className="text-sm text-white/55">No first opens in this date range.</p>
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const n = pick(s, platform)
        const prev = i > 0 ? pick(steps[i - 1], platform) : 0
        return (
          <div key={s.step} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.75rem_6rem] items-center gap-3 text-xs">
            <span className="text-white/80">{s.step}</span>
            <div className="h-6 overflow-hidden rounded-md bg-white/[0.06]">
              <div className="h-full rounded-md bg-ocean" style={{ width: `${Math.max(1, (n / first) * 100)}%` }} />
            </div>
            <span className="text-right font-medium tabular-nums text-white">{fInt(n)}</span>
            <span className={cn('tabular-nums', i === worst ? 'font-medium text-remove' : 'text-white/45')}>
              {i === 0 ? '' : `−${fInt(prev - n)} · ${fPct(losses[i] ?? 0)}`}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function PlatformTable({ steps }: { steps: FunnelStep[] }) {
  const a0 = steps[0]?.android || 0
  const i0 = steps[0]?.ios || 0
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs tabular-nums">
        <thead>
          <tr className="text-left text-white/45">
            <th className="py-2 pr-3 font-medium">Step</th>
            <th className="py-2 pr-3 text-right font-medium">Android</th>
            <th className="py-2 text-right font-medium">iOS</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.step} className="border-t border-white/[0.06]">
              <td className="py-2 pr-3 text-white/80">{s.step}</td>
              <td className="py-2 pr-3 text-right text-white">{a0 ? fPct(s.android / a0) : '—'}</td>
              <td className="py-2 text-right text-white">{i0 ? fPct(s.ios / i0) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- scan outcomes ----------

export function ScanOutcomes({ events }: { events: EventStats }) {
  const started = events.scan_started?.count ?? 0
  if (started === 0) return <p className="text-sm text-white/55">No scans started in this selection.</p>
  const done = events.scan_completed?.count ?? 0
  const cancelled = events.scan_cancelled?.count ?? 0
  const failed = events.scan_failed?.count ?? 0
  const none = Math.max(0, started - done - cancelled - failed)
  const parts = [
    { label: 'Completed', n: done, color: OCEAN },
    { label: 'Cancelled', n: cancelled, color: AMBER },
    { label: 'Failed', n: failed, color: RED },
    { label: 'No result logged', n: none, color: 'rgba(255,255,255,0.25)' },
  ]
  return (
    <div>
      <div className="flex h-6 gap-0.5 overflow-hidden rounded-md">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.n / started) * 100}%`, background: p.color, minWidth: p.n ? 2 : 0 }} />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs tabular-nums">
        {parts.map((p) => (
          <li key={p.label} className="grid grid-cols-[0.625rem_minmax(0,1fr)_auto_3rem] items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            <span className="text-white/80">{p.label}</span>
            <span className="text-right text-white">{fInt(p.n)}</span>
            <span className="text-right text-white/45">{fPct(p.n / started)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------- charts ----------

const tooltipStyle = {
  background: '#0B1530',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  fontSize: 12,
  color: '#fff',
}

export function DailyChart({ daily }: { daily: DailyPoint[] }) {
  if (daily.length === 0) return <p className="text-sm text-white/55">No activity in this selection.</p>
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke={AXIS} tick={{ fontSize: 11 }} minTickGap={24} />
          <YAxis stroke={AXIS} tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} />
          <Area type="monotone" dataKey="activeUsers" name="Active users" stroke={SKY} fill={SKY} fillOpacity={0.15} strokeWidth={2} />
          <Line type="monotone" dataKey="newUsers" name="New users" stroke={OCEAN} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function inWindow(hour: number, from: number, to: number) {
  return from <= to ? hour >= from && hour <= to : hour >= from || hour <= to
}

export function HourlyChart({ hourly, hourFrom, hourTo }: { hourly: HourPoint[]; hourFrom: number; hourTo: number }) {
  const data = useMemo(() => {
    const byHour = new Map(hourly.map((h) => [h.hour, h]))
    return Array.from({ length: 24 }, (_, hour) => ({ hour, events: byHour.get(hour)?.events ?? 0, users: byHour.get(hour)?.activeUsers ?? 0 }))
  }, [hourly])
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="hour" tickFormatter={hh} stroke={AXIS} tick={{ fontSize: 11 }} interval={2} />
          <YAxis stroke={AXIS} tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            labelFormatter={(h) => `${hh(Number(h))}:00 UTC`}
          />
          <Bar dataKey="events" name="Events" radius={[3, 3, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.hour} fill={inWindow(d.hour, hourFrom, hourTo) ? SKY : 'rgba(255,255,255,0.18)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------- features ----------

interface Ranked extends FeatureRow {
  reach: number
  perUser: number
  tier: ReturnType<typeof tierOf>
  platform: string
}

const TIER_COLOR = { Core: OCEAN, Occasional: SKY, Rare: 'rgba(255,255,255,0.35)' } as const

function rank(features: FeatureRow[], base: number): Ranked[] {
  const denom = Math.max(1, base)
  return features
    .filter((f) => f.feature !== 'Login')
    .map((f) => {
      const reach = f.users / denom
      return {
        ...f,
        reach,
        perUser: f.opens / Math.max(1, f.users),
        tier: tierOf(reach),
        platform: f.androidOpens > 0 && f.iosOpens > 0 ? 'Both' : f.androidOpens > 0 ? 'Android only' : 'iOS only',
      }
    })
}

function RankedList({ rows, max }: { rows: Ranked[]; max: number }) {
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.feature} className="grid grid-cols-[minmax(5.5rem,9rem)_minmax(0,1fr)_minmax(5rem,auto)] items-center gap-3 text-xs">
          <span className="break-words text-white/85">{r.feature}</span>
          <div className="h-3.5 overflow-hidden rounded bg-white/[0.06]">
            <div className="h-full rounded" style={{ width: `${Math.max(0.5, (r.reach / max) * 100)}%`, background: TIER_COLOR[r.tier] }} />
          </div>
          <span className="text-right tabular-nums text-white/55">
            {fPct(r.reach, 1)} · {fInt(r.users)} {r.users === 1 ? 'user' : 'users'}
          </span>
        </li>
      ))}
    </ul>
  )
}

type SortKey = 'feature' | 'platform' | 'tier' | 'users' | 'reach' | 'opens' | 'perUser' | 'avgSec'

export function FeaturePanels({ features, base }: { features: FeatureRow[]; base: number }) {
  const rows = useMemo(() => rank(features, base), [features, base])
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'users', dir: -1 })
  const [query, setQuery] = useState('')

  const max = Math.max(0.0001, ...rows.map((r) => r.reach))
  const top = [...rows].sort((a, b) => b.users - a.users || b.opens - a.opens).slice(0, 8)
  const bottom = [...rows].sort((a, b) => a.users - b.users || a.opens - b.opens).slice(0, 8)

  const table = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => !q || `${r.feature} ${r.platform} ${r.tier}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const x = a[sort.key]
        const y = b[sort.key]
        const c = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : ((x as number | null) ?? -1) - ((y as number | null) ?? -1)
        return c * sort.dir || a.feature.localeCompare(b.feature)
      })
  }, [rows, sort, query])

  if (rows.length === 0) {
    return <p className="text-sm text-white/55">No feature opens in this selection.</p>
  }

  const heading = (key: SortKey, label: string, right = false) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={cn('whitespace-nowrap py-2 pr-3 font-medium', key === 'feature' && 'pl-3', right && 'text-right')}>
      <button
        type="button"
        onClick={() => setSort((s) => (s.key === key ? { key, dir: (-s.dir) as 1 | -1 } : { key, dir: key === 'feature' || key === 'platform' || key === 'tier' ? 1 : -1 }))}
        className="hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky"
      >
        {label}
        {sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/45">
        Reach is the share of users who opened any feature that opened this one. Core is {fPct(CORE_REACH)} or more, occasional is {fPct(OCCASIONAL_REACH)} to {fPct(CORE_REACH)}, rare is under {fPct(OCCASIONAL_REACH)}. Login is left out.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Most used" note="Top eight by users, on the same scale as the list beside it.">
          <RankedList rows={top} max={max} />
        </Card>
        <Card title="Least used" note="Bottom eight by users who opened them.">
          <RankedList rows={bottom} max={max} />
        </Card>
      </div>
      <Card title="Every feature" note="Select a heading to sort. Average visit is the mean time between a feature opening and closing.">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter features"
          aria-label="Filter features"
          className="mb-3 w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-sky/40"
        />
        <div className="max-h-[28rem] overflow-auto rounded-lg border border-white/[0.07]">
          <table className="w-full text-xs tabular-nums">
            <thead className="sticky top-0 bg-[#0B1530] text-left text-white/45">
              <tr>
                {heading('feature', 'Feature')}
                {heading('platform', 'Platforms')}
                {heading('tier', 'Tier')}
                {heading('users', 'Users', true)}
                {heading('reach', 'Reach', true)}
                {heading('opens', 'Opens', true)}
                {heading('perUser', 'Opens per user', true)}
                {heading('avgSec', 'Avg visit (s)', true)}
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.feature} className="border-t border-white/[0.06]">
                  <td className="py-2 pl-3 pr-3 text-white">{r.feature}</td>
                  <td className="py-2 pr-3 text-white/65">{r.platform}</td>
                  <td className="py-2 pr-3">
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px]" style={{ color: r.tier === 'Rare' ? 'rgba(255,255,255,0.55)' : '#fff' }}>
                      {r.tier}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right text-white">{fInt(r.users)}</td>
                  <td className="py-2 pr-3 text-right text-white/80">{fPct(r.reach, 1)}</td>
                  <td className="py-2 pr-3 text-right text-white/80">{fInt(r.opens)}</td>
                  <td className="py-2 pr-3 text-right text-white/80">{r.perUser.toFixed(1)}</td>
                  <td className="py-2 pr-3 text-right text-white/80">{r.avgSec === null ? '' : r.avgSec.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
