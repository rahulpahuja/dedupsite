import { LandingPage, landingMetadata } from '@/components/seo/landing-page'

export const dynamic = 'force-static'

export const metadata = landingMetadata('/ai-storage-cleaner')

export default function Page() {
  return <LandingPage path="/ai-storage-cleaner" />
}
