import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export const metadata: Metadata = {
  title: 'Analytics | DeDup',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login?next=/analytics')
  }
  return <AnalyticsDashboard today={new Date().toISOString().slice(0, 10)} />
}
