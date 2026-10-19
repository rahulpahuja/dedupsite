import Link from 'next/link'
import { Gavel } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'

export const dynamic = 'force-static'

/** Shown in the heading chip. Update whenever the text changes. */
const TERMS_UPDATED = 'October 19, 2026'

export const metadata = {
  title: 'Terms of Use — DeDup',
  description:
    'Ownership and usage terms for the DeDup apps. Reverse engineering and re-publishing without written permission are prohibited.',
  alternates: { canonical: 'https://dedup.space/terms' },
}

const h3 = 'mb-2 font-display text-base font-semibold text-white'
const term = 'text-white/90'
const link = 'text-sky underline-offset-4 hover:underline'

export default function TermsPage() {
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
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Terms of Use</h1>
          <span className="mb-8 mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
            Updated {TERMS_UPDATED}
          </span>

          <div className="space-y-6 text-sm leading-relaxed text-white/75">
            <section>
              <p>
                These terms cover the <strong className="text-white">DeDup</strong> apps for Android
                and iPhone and the dedup.space website, all published by Rahul Pahuja (&ldquo;the
                author&rdquo;). By using them you agree to these terms.
              </p>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky/20 bg-sky/[0.07] p-4">
                <Gavel className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky" />
                <p>
                  <strong className="text-white">Legal notice:</strong> Any reverse engineering or
                  re-publishing of DeDup, in whole or in part, without the prior written permission
                  of the original author will lead to legal action in India and in any other country
                  where the infringement occurs or the infringer is located, and to claims for
                  damages worth billions of dollars.
                </p>
              </div>
            </section>

            <section>
              <h3 className={h3}>1. Ownership</h3>
              <p>
                DeDup, including its apps, source code, algorithms, user interface, design, text,
                images, name and logo, is the property of the author and is protected by copyright
                and other intellectual property laws of India and international treaties. Using the
                apps gives you a personal, non-transferable licence to run them on your own
                devices. It does not transfer any ownership.
              </p>
            </section>

            <section>
              <h3 className={h3}>2. Who These Terms Apply To</h3>
              <p>
                These terms apply to everyone who downloads, installs or uses DeDup, or visits
                dedup.space, anywhere in the world. They apply regardless of where you are located
                or which app store you used to get the apps. They apply to every version of DeDup,
                past, present and future, from its first release onward, including old versions
                and any versions published later.
              </p>
            </section>

            <section>
              <h3 className={h3}>3. What You May Not Do</h3>
              <p className="mb-2">Without the prior written permission of the author, you may not:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className={term}>Reverse engineer</strong>, decompile, disassemble,
                  deobfuscate or otherwise attempt to derive the source code, algorithms or
                  internal workings of the apps.
                </li>
                <li>
                  <strong className={term}>Re-publish</strong>, redistribute, repackage, resell,
                  sublicense or mirror the apps, or upload them to any app store, website or file
                  host.
                </li>
                <li>
                  <strong className={term}>Copy or clone</strong> the apps, their interface, design
                  or content, or publish a substantially similar product derived from them.
                </li>
                <li>
                  <strong className={term}>Reuse the brand</strong>: the DeDup name, logo and store
                  listings, screenshots, or website text and imagery.
                </li>
                <li>
                  <strong className={term}>Tamper</strong> with the apps, remove or alter any
                  notices, or circumvent any technical protection.
                </li>
              </ul>
            </section>

            <section>
              <h3 className={h3}>4. Consequences</h3>
              <p>
                A breach of section 3 will be pursued through civil and, where applicable, criminal
                proceedings in India, under the Copyright Act, 1957, the Information Technology Act,
                2000 and other applicable law, and in any other country where the breach occurs.
                The author will seek injunctions, the removal of infringing material, and damages
                and compensation worth billions of dollars, along with legal costs.
              </p>
            </section>

            <section>
              <h3 className={h3}>5. Getting Permission</h3>
              <p>
                Permission is valid only if it is given in writing by the original author. To ask
                for it, email{' '}
                <a href="mailto:therahulpahuja@gmail.com" className={link}>
                  therahulpahuja@gmail.com
                </a>{' '}
                describing what you want to do. Silence, a missing reply, or the apps being
                technically accessible does not count as permission.
              </p>
            </section>

            <section>
              <h3 className={h3}>6. Governing Law</h3>
              <p>
                These terms are governed by the laws of India, and the courts in India have
                jurisdiction over any dispute arising from them. The author may also enforce these
                terms, and seek injunctions and takedowns, in any other jurisdiction, including
                through app stores and hosting providers.
              </p>
            </section>

            <section>
              <h3 className={h3}>7. License</h3>
              <p>
                DeDup is proprietary software. Copyright &copy; 2026 Rahul Pahuja. All rights
                reserved, for every version of DeDup, past, present and future. No licence is granted except the personal, non-transferable right to use
                the apps described in section 1. The full text is in the{' '}
                <a
                  href="https://github.com/rahulpahuja/dedupsite/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  LICENSE file
                </a>
                .
              </p>
            </section>

            <section>
              <h3 className={h3}>8. Privacy</h3>
              <p>
                How the apps handle your data is described in the{' '}
                <Link href="/privacy" className={link}>
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
