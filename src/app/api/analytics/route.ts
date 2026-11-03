import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { filtersSchema, loadDashboardInputs } from '@/lib/analytics'
import { buildInsights } from '@/lib/analytics-insights'
import { mockInputs } from '@/lib/analytics-mock'
import { GaError } from '@/lib/ga'
import type { DashboardData } from '@/lib/analytics-types'

export const dynamic = 'force-dynamic'

const mockEnabled = () => process.env.ANALYTICS_MOCK === '1' && process.env.NODE_ENV !== 'production'

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = filtersSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid filters' }, { status: 400 })
  }

  try {
    const inputs = mockEnabled() ? mockInputs(parsed.data) : await loadDashboardInputs(parsed.data)
    const body: DashboardData = { ...inputs, generatedAt: new Date().toISOString(), insights: buildInsights(inputs) }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof GaError) return NextResponse.json({ error: e.message }, { status: e.status })
    console.error('analytics: unexpected failure', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Could not load analytics.' }, { status: 500 })
  }
}
