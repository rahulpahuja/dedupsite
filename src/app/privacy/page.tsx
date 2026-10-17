import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { PRIVACY_POLICY_UPDATED, PrivacyPolicyContent } from '@/components/privacy-policy'

export const dynamic = 'force-static'

export const metadata = {
  title: 'Privacy Policy — DeDup',
  description: 'How the DeDup apps for Android and iPhone handle your data. Scans run on your device.',
  alternates: { canonical: 'https://dedup.space/privacy' },
}

/** The policy URL linked from the App Store and Google Play listings and from inside the apps. */
export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-[#060D1F]">
      <nav className="px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" aria-label="DeDup home">
            <BrandLogo />
          </Link>
          <Link href="/" className="text-sm text-white/60 transition hover:text-white">
            Home
          </Link>
        </div>
      </nav>
      <div className="px-6 pb-24 pt-10">
        <article className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0D2347] p-6 shadow-2xl sm:p-10">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <span className="mb-8 mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
            Updated {PRIVACY_POLICY_UPDATED}
          </span>
          <PrivacyPolicyContent />
        </article>
      </div>
    </main>
  )
}
