import { LandingPage, landingMetadata } from '@/components/seo/landing-page'

export const dynamic = 'force-static'

export const metadata = landingMetadata('/duplicate-photo-cleaner')

export default function Page() {
  return <LandingPage path="/duplicate-photo-cleaner" />
}
