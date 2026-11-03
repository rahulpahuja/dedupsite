import {
  type DashboardInputs,
  type Insight,
  OCCASIONAL_REACH,
  tierOf,
} from './analytics-types'

const pct = (n: number) => `${Math.round(n * 100)}%`
const hh = (h: number) => `${String(h % 24).padStart(2, '0')}:00`
const MIN_SAMPLE = 20 // below this many users a rate is too noisy to act on

/** What to try for each step where people leave. Keyed by the step they failed to reach. */
const STEP_ACTIONS: Record<string, string> = {
  Login:
    'Let people see value before they sign in: run the first scan as a guest and ask for sign-in only when they want to clean up. Offer Apple/Google sign-in as one tap and keep the screen to a single button.',
  'Scan started':
    'Make the first scan the obvious next move after login: one large "Scan now" button on the Dashboard, a permission explainer shown right before the system prompt, and a reminder notification for people who stop here.',
  'Scan completed':
    'Scans are being left unfinished. Show progress with a time estimate, keep scanning in the background and resume after an interruption, and check scan_failed and crash reports for the devices where it stops.',
  'Cleanup completed':
    'People see results but do not clean. Lead the results with the space they will free, pre-select the safe best-shot picks behind one "Clean up" button, and say that deleted items go to Trash first so they can be restored.',
}

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const

export function buildInsights(d: DashboardInputs): Insight[] {
  const out: Insight[] = []
  const steps = d.funnel
  const first = steps[0]
  const last = steps[steps.length - 1]

  // 1. Biggest loss between two funnel steps
  if (first && first.all >= MIN_SAMPLE) {
    let worst: { step: string; lost: number; rate: number; from: string } | null = null
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1]
      const cur = steps[i]
      if (prev.all < MIN_SAMPLE) continue
      const lost = prev.all - cur.all
      const rate = lost / prev.all
      if (!worst || rate > worst.rate) worst = { step: cur.step, lost, rate, from: prev.step }
    }
    if (worst && worst.rate >= 0.15) {
      out.push({
        id: 'funnel-leak',
        severity: worst.rate >= 0.4 ? 'high' : 'medium',
        title: `Fix the drop before "${worst.step}"`,
        evidence: `${pct(worst.rate)} of people who reached "${worst.from}" never reach "${worst.step}" (${worst.lost} users).`,
        action: STEP_ACTIONS[worst.step] ?? 'Look at what happens between these two steps and remove one decision.',
      })
    }
  }

  // 2. Android vs iOS gap
  if (first && last && first.android >= MIN_SAMPLE && first.ios >= MIN_SAMPLE) {
    const a = last.android / first.android
    const i = last.ios / first.ios
    if (Math.abs(a - i) >= 0.1) {
      const weaker = a < i ? 'Android' : 'iOS'
      const stronger = a < i ? 'iOS' : 'Android'
      let gapStep = ''
      let gapSize = 0
      for (let k = 1; k < steps.length; k++) {
        const diff = Math.abs(steps[k].android / first.android - steps[k].ios / first.ios)
        if (diff > gapSize) {
          gapSize = diff
          gapStep = steps[k].step
        }
      }
      out.push({
        id: 'platform-gap',
        severity: 'high',
        title: `${weaker} converts worse than ${stronger}`,
        evidence: `${pct(Math.min(a, i))} of ${weaker} first-time openers finish a cleanup, against ${pct(Math.max(a, i))} on ${stronger}. The gap is widest at "${gapStep}".`,
        action: `Run both apps side by side up to "${gapStep}" and list every difference: extra permission prompts, slower scans, sign-in steps, screen order. Bring ${weaker} in line with ${stronger}.`,
      })
    }
  }

  // 3. How scans end
  const started = d.events.scan_started?.count ?? 0
  if (started >= MIN_SAMPLE) {
    const done = d.events.scan_completed?.count ?? 0
    const cancelled = d.events.scan_cancelled?.count ?? 0
    const failed = d.events.scan_failed?.count ?? 0
    const bad = (cancelled + failed) / started
    const silent = Math.max(0, started - done - cancelled - failed) / started
    if (bad >= 0.15) {
      out.push({
        id: 'scan-exits',
        severity: failed / started >= 0.08 ? 'high' : 'medium',
        title: 'Too many scans are cancelled or fail',
        evidence: `${pct(cancelled / started)} of scans are cancelled and ${pct(failed / started)} fail, out of ${started} started.`,
        action:
          'Group scan_failed by failure_stage and failure_reason in Analytics and fix the top cause first. For cancels, show how long the scan will take before it starts and let it run in the background.',
      })
    }
    if (silent >= 0.2) {
      out.push({
        id: 'scan-silent',
        severity: 'medium',
        title: 'A fifth of scans end with no recorded result',
        evidence: `${pct(silent)} of started scans never log completed, cancelled or failed.`,
        action:
          'Either the app is being closed or killed mid-scan, or an exit path is not instrumented. Log an outcome on every exit (including app backgrounded) so these become visible.',
      })
    }
  }

  // 4. Features nobody opens, and hidden gems
  const base = Math.max(1, d.events.feature_opened?.users ?? 0)
  const rows = d.features
    .filter((f) => f.feature !== 'Login')
    .map((f) => ({ ...f, reach: f.users / base, perUser: f.opens / Math.max(1, f.users) }))
  const rare = rows.filter((f) => f.reach < OCCASIONAL_REACH)
  if (rare.length >= 3) {
    const names = rare
      .slice()
      .sort((a, b) => a.users - b.users || a.opens - b.opens)
      .slice(0, 5)
      .map((f) => f.feature)
      .join(', ')
    out.push({
      id: 'rare-features',
      severity: 'medium',
      title: `${rare.length} features are used by under ${pct(OCCASIONAL_REACH)} of people`,
      evidence: `Least used: ${names}.`,
      action:
        'For each one, decide: promote it (a card on the Dashboard after a related scan), merge it into a feature people already use, or remove it from navigation. Fewer destinations make the first scan easier to find.',
    })
  }
  const gems = rows
    .filter((f) => f.perUser >= 3 && tierOf(f.reach) !== 'Core' && f.users >= 5)
    .sort((a, b) => b.perUser - a.perUser)
    .slice(0, 3)
  if (gems.length) {
    out.push({
      id: 'hidden-gems',
      severity: 'low',
      title: 'Some features are loved by the few who find them',
      evidence: gems.map((f) => `${f.feature}: ${f.perUser.toFixed(1)} opens per user, ${pct(f.reach)} reach`).join('; ') + '.',
      action: 'These keep people coming back but few discover them. Link to them from the Dashboard and from the end of a scan.',
    })
  }
  const slow = rows.filter((f) => (f.avgSec ?? 0) >= 180 && f.users >= 10)
  if (slow.length) {
    out.push({
      id: 'long-visits',
      severity: 'low',
      title: 'Some screens hold people for minutes',
      evidence: slow.map((f) => `${f.feature}: ${Math.round((f.avgSec ?? 0) / 60)} min average`).join('; ') + '.',
      action:
        'If this is waiting for a scan, show progress and let people leave and return. If it is reading or browsing, check the screen is not hiding the next action.',
    })
  }

  // 5. Trend against the previous period
  const t = d.totals
  if (t.prevActiveUsers >= 10) {
    const change = t.activeUsers / t.prevActiveUsers - 1
    if (change <= -0.2) {
      out.push({
        id: 'usage-down',
        severity: 'high',
        title: 'Fewer people are active than in the previous period',
        evidence: `${t.activeUsers} active users, down ${pct(-change)} from ${t.prevActiveUsers}.`,
        action:
          'Check whether a release, a notification campaign or an install source changed. Send a re-engagement notification that names a concrete result, such as how much space a new scan could free.',
      })
    } else if (change >= 0.2) {
      out.push({
        id: 'usage-up',
        severity: 'low',
        title: 'Usage is growing',
        evidence: `${t.activeUsers} active users, up ${pct(change)} from ${t.prevActiveUsers}.`,
        action: 'Growth only helps if new users reach their first cleanup. Watch the funnel above for new drop-offs as volume rises.',
      })
    }
  }

  // 6. Best time to reach people
  const total = d.hourly.reduce((s, h) => s + h.events, 0)
  if (total >= 200 && d.hourly.length >= 12) {
    const byHour = new Array<number>(24).fill(0)
    d.hourly.forEach((h) => (byHour[h.hour] = h.events))
    let best = 0
    let bestSum = -1
    for (let s = 0; s < 24; s++) {
      const sum = byHour[s] + byHour[(s + 1) % 24] + byHour[(s + 2) % 24]
      if (sum > bestSum) {
        bestSum = sum
        best = s
      }
    }
    out.push({
      id: 'peak-hours',
      severity: 'low',
      title: `Send notifications around ${hh(best)}-${hh(best + 3)} UTC`,
      evidence: `${pct(bestSum / total)} of activity falls in those three hours.`,
      action: 'Schedule campaign and reminder notifications to land just before this window.',
    })
  }

  // 7. Tracking quality
  const opened = d.events.feature_opened?.count ?? 0
  const named = d.features.reduce((s, f) => s + f.opens, 0)
  if (opened >= 100 && named / opened < 0.7) {
    out.push({
      id: 'tracking-gap',
      severity: 'low',
      title: 'Feature names are missing on many opens',
      evidence: `Only ${pct(named / opened)} of feature_opened events carry a feature name (${named} of ${opened}).`,
      action: 'Send feature_name with every feature_opened event so the most and least used lists are complete.',
    })
  }

  return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}
