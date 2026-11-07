import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'
import { PlayButton, SiteFooter, SiteHeader } from '@/components/seo/site-chrome'
import { LANDING_PAGES, type LandingContent, type Shot } from '@/content/landing-pages'
import {
  FEATURE_PAGES,
  DEFAULT_SHARE_IMAGE,
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  softwareApplicationJsonLd,
  type FeaturePath,
} from '@/lib/site'

/** Metadata for a feature page: unique title, description, canonical, Open Graph and X card. */
export function landingMetadata(path: FeaturePath): Metadata {
  const c = LANDING_PAGES[path]
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: c.title,
      description: c.description,
      url: absoluteUrl(path),
      siteName: 'DeDup',
      type: 'website',
      locale: 'en_US',
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: c.title,
      description: c.description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
  }
}

function Screenshot({ shot, priority = false }: { shot: Shot; priority?: boolean }) {
  return (
    <figure className="mx-auto w-full max-w-[280px]">
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        priority={priority}
        sizes="(max-width: 640px) 70vw, 280px"
        className="h-auto w-full rounded-[28px] border border-white/10 shadow-2xl"
      />
      <figcaption className="mt-3 text-center text-xs leading-relaxed text-white/50">{shot.caption}</figcaption>
    </figure>
  )
}

export function LandingPage({ path }: { path: FeaturePath }) {
  const c: LandingContent = LANDING_PAGES[path]
  const placement = path.slice(1)
  const related = FEATURE_PAGES.filter((p) => p.path !== path)

  return (
    <div className="min-h-screen bg-[#060D1F] text-white">
      <JsonLd
        data={[
          softwareApplicationJsonLd({ description: c.description, url: path }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: c.label, path },
          ]),
          faqJsonLd(c.faqs),
        ]}
      />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1fr_280px]">
            <div>
              <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/50">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link href="/" prefetch={false} className="hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="text-white/70">
                    {c.label}
                  </li>
                </ol>
              </nav>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky">{c.eyebrow}</p>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">{c.h1}</h1>
              {c.intro.map((p) => (
                <p key={p} className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
                  {p}
                </p>
              ))}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <PlayButton placement={`${placement}_hero`} />
                <span className="flex items-center gap-2 text-xs text-white/55">
                  <Shield className="h-3.5 w-3.5 text-keep" aria-hidden="true" />
                  Scans run on your phone
                </span>
              </div>
            </div>
            <Screenshot shot={c.hero} priority />
          </div>
        </section>

        {/* Body sections */}
        {c.sections.map((s, i) => (
          <section
            key={s.h2}
            className={`px-4 py-14 sm:px-6 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} border-t border-white/[0.05]`}
          >
            <div
              className={`mx-auto grid max-w-5xl gap-10 ${s.shot ? 'md:grid-cols-[1fr_280px] md:items-start' : ''}`}
            >
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{s.h2}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mt-4 leading-relaxed text-white/70">
                    {p}
                  </p>
                ))}
                {s.subsections && (
                  <div className="mt-6 space-y-5">
                    {s.subsections.map((sub) => (
                      <div key={sub.h3}>
                        <h3 className="font-display text-lg font-semibold text-white">{sub.h3}</h3>
                        <p className="mt-1.5 leading-relaxed text-white/70">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {s.bullets && (
                  <ul className="mt-5 list-disc space-y-2.5 pl-5 leading-relaxed text-white/70 marker:text-sky">
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
              {s.shot && <Screenshot shot={s.shot} />}
            </div>
          </section>
        ))}

        {/* FAQ: visible on the page, and the same text is in the FAQPage markup above */}
        <section className="border-t border-white/[0.05] px-4 py-14 sm:px-6" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl">
            <h2 id="faq-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
              {c.faqs.map((f) => (
                <details key={f.q} data-faq={f.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                    <h3 className="text-base">{f.q}</h3>
                    <span aria-hidden="true" className="text-sky transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-white/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related pages and guides */}
        <section className="border-t border-white/[0.05] bg-white/[0.02] px-4 py-14 sm:px-6" aria-labelledby="related-heading">
          <div className="mx-auto max-w-5xl">
            <h2 id="related-heading" className="font-display text-2xl font-bold tracking-tight">
              More ways DeDup frees up storage
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.path}>
                  <Link
                    href={r.path}
                    className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-sky/40 hover:bg-white/[0.05]"
                  >
                    <span className="font-display font-semibold text-white">{r.label}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-white/60">
                      {LANDING_PAGES[r.path].teaser}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {c.guides.length > 0 && (
              <>
                <h3 className="mt-10 font-display text-lg font-semibold">Detailed guides</h3>
                <ul className="mt-3 space-y-2">
                  {c.guides.map((g) => (
                    <li key={g.href}>
                      <Link href={g.href} className="text-sky underline-offset-4 hover:text-white hover:underline">
                        {g.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-ocean/25 via-sky/[0.06] to-transparent px-6 py-12 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">Reclaim your storage</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
              DeDup is free on Google Play for Android. Scan first, review what it finds, and remove only
              what you choose.
            </p>
            <div className="mt-7 flex justify-center">
              <PlayButton placement={`${placement}_footer`} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
