import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { loadRealtime } from '@/lib/analytics'
import { mockRealtime } from '@/lib/analytics-mock'
import { GaError } from '@/lib/ga'

export const dynamic = 'force-dynamic'

const mockEnabled = () => process.env.ANALYTICS_MOCK === '1' && process.env.NODE_ENV !== 'production'

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = mockEnabled() ? mockRealtime() : await loadRealtime()
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    if (e instanceof GaError) return NextResponse.json({ error: e.message }, { status: e.status })
    return NextResponse.json({ error: 'Could not load live users.' }, { status: 500 })
  }
}
