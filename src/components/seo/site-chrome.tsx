import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { GooglePlayIcon } from '@/components/brand/store-icons'
import { FEATURE_PAGES, playStoreUrl } from '@/lib/site'

/** Google Play button with UTM parameters; `placement` becomes utm_content and the event's placement. */
export function PlayButton({ placement, label = 'Download on Google Play' }: { placement: string; label?: string }) {
  return (
    <a
      href={playStoreUrl(placement)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta={placement}
      className="btn-primary-3d"
    >
      <GooglePlayIcon className="h-[18px] w-[18px]" />
      {label}
    </a>
  )
}

/** Header for the static content pages (feature pages). Server-rendered, no client JS. */
export function SiteHeader() {
  return (
    <header className="px-4 py-4 sm:px-6">
      <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" prefetch={false} aria-label="DeDup home">
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/#features" prefetch={false} className="hidden text-white/65 transition hover:text-white sm:inline">
            Features
          </Link>
          <Link href="/blog" className="text-white/65 transition hover:text-white">
            Blog
          </Link>
          <a
            href={playStoreUrl('header')}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="header"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
          >
            Get the app
          </a>
        </div>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060D1F] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/50">
            DeDup: AI storage cleaner for Android. Find duplicates and unnecessary files and reclaim
            storage, with scanning on your phone.
          </p>
        </div>
        <nav aria-label="Features">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Features</h2>
          <ul className="space-y-2 text-sm">
            {FEATURE_PAGES.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="text-white/65 transition hover:text-white">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">More</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/blog" className="text-white/65 transition hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-white/65 transition hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-white/65 transition hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-xs text-white/45">© 2026 Rahul Pahuja, Mobile1x</p>
    </footer>
  )
}
