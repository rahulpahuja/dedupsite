import type { Metadata } from 'next'
import HomeClient from './home-client'
import { JsonLd } from '@/components/seo/json-ld'
import { DEFAULT_SHARE_IMAGE, organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from '@/lib/site'

const TITLE = 'DeDup: AI Storage Cleaner – Clean Your Phone, Reclaim Storage'
const DESCRIPTION =
  'Find duplicate photos, similar images, repeated videos and unnecessary files with DeDup, the AI-powered storage cleaner for Android. Scans run on your phone and you review everything first.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://dedup.space' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://dedup.space',
    siteName: 'DeDup',
    type: 'website',
    locale: 'en_US',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@therahulpahuja',
    images: [DEFAULT_SHARE_IMAGE.url],
  },
}

// Textures for the homepage 3D scene only, so other pages don't download them.
const SCENE_PRELOADS = [
  '/dedup-assets/photo-0.png',
  '/dedup-assets/photo-1.png',
  '/dedup-assets/music-0.png',
  '/dedup-assets/ai-orb.png',
]

export default function HomePage() {
  return (
    <>
      {SCENE_PRELOADS.map((href) => (
        <link key={href} rel="preload" href={href} as="image" />
      ))}
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd({ description: DESCRIPTION }),
        ]}
      />
      <HomeClient />
    </>
  )
}
