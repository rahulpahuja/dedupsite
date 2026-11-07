import { LandingPage, landingMetadata } from '@/components/seo/landing-page'

export const dynamic = 'force-static'

export const metadata = landingMetadata('/duplicate-video-cleaner')

export default function Page() {
  return <LandingPage path="/duplicate-video-cleaner" />
}
