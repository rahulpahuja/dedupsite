import { LandingPage, landingMetadata } from '@/components/seo/landing-page'

export const dynamic = 'force-static'

export const metadata = landingMetadata('/whatsapp-cleaner')

export default function Page() {
  return <LandingPage path="/whatsapp-cleaner" />
}
