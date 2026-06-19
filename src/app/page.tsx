'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Sparkles,
  MessageCircle,
  Camera,
  Film,
  Music,
  MessagesSquare,
  Receipt,
  Download,
  UserCheck,
  UserX,
  X,
  Star,
} from 'lucide-react'

// 3D scene is loaded only on client (Three.js needs window)
const DedupScene = dynamic(() => import('@/components/three/DedupScene'), {
  ssr: false,
})
const GeminiAurora = dynamic(() => import('@/components/dedup/GeminiAurora'), {
  ssr: false,
})

/* ───────────────────────────────────────────────────────────────
   ICONS
   ─────────────────────────────────────────────────────────────── */

function GooglePlayIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3.18 23.76c.37.2.8.22 1.19.06l12.19-7.04-2.68-2.68L3.18 23.76z" />
      <path
        d="M22.14 10.4c-.54-.31-1.24-.31-1.78 0l-2.64 1.52-2.95-2.95 2.95-2.95 2.64 1.52c.54.31 1.24.31 1.78 0 .54-.31.86-.88.86-1.5s-.32-1.19-.86-1.5L4.37.24C3.98.08 3.55.1 3.18.3L13.88 11 3.18 21.7c.37.2.8.22 1.19.06L20.36 12.9l1.78-1.02c.54-.31.86-.88.86-1.5s-.32-1.18-.86-1.5v.52z"
        opacity=".6"
      />
      <path d="M3.18.3C2.64.61 2.32 1.18 2.32 1.8v20.4c0 .62.32 1.19.86 1.5l10.7-10.7L3.18.3z" />
    </svg>
  )
}

/* ───────────────────────────────────────────────────────────────
   DATA — feature cards (shown AFTER the cinematic reveal)
   ─────────────────────────────────────────────────────────────── */

type Feature = {
  icon: React.ReactNode
  title: string
  desc: string
  tags: string[]
  tint: 'media' | 'smart' | 'contacts' | 'ai'
}

const MEDIA_FEATURES: Feature[] = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: 'Photo Deduplication',
    desc: 'Finds exact copies and near-identical shots — burst photos, multiple saves, edited vs. original. Compares pixel-level fingerprints entirely on-device.',
    tags: ['Exact match', 'Near-duplicate', 'Burst shots'],
    tint: 'media',
  },
  {
    icon: <Film className="h-5 w-5" />,
    title: 'Video Deduplication',
    desc: 'Detects duplicate video files including re-downloads, different quality saves, and trimmed variants. Side-by-side preview before you delete.',
    tags: ['Re-downloads', 'Multi-quality', 'Preview first'],
    tint: 'media',
  },
  {
    icon: <Music className="h-5 w-5" />,
    title: 'Audio & Docs',
    desc: 'Scans your music library, voice notes, PDFs, and documents for exact-duplicate files wasting space across folders.',
    tags: ['Music library', 'PDFs', 'Voice notes'],
    tint: 'media',
  },
]

const SMART_FEATURES: Feature[] = [
  {
    icon: <MessagesSquare className="h-5 w-5" />,
    title: 'WhatsApp Cleaner',
    desc: 'Automatically surfaces forwarded memes, viral screenshots, and sticker packs clogging your WhatsApp Media folder. One-tap bulk delete.',
    tags: ['Forwarded memes', 'Sticker packs', 'Group media'],
    tint: 'smart',
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: 'Screenshots & Receipts',
    desc: 'Detects screenshots you no longer need — OTP screens, delivery receipts, payment confirmations, and app notifications saved by accident.',
    tags: ['OTP screens', 'Receipts', 'Notifications'],
    tint: 'smart',
  },
  {
    icon: <Download className="h-5 w-5" />,
    title: 'Downloads Junk',
    desc: 'Finds re-downloaded files, duplicate APKs, and forgotten install packages sitting in your Downloads folder eating up gigabytes.',
    tags: ['Duplicate APKs', 'Re-downloads', 'Install leftovers'],
    tint: 'smart',
  },
]

const CONTACTS_FEATURES: Feature[] = [
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Duplicate Contact Merger',
    desc: 'Finds contacts saved multiple times — same person across WhatsApp, Google, and SIM. Merges them cleanly, keeping all numbers and emails, removing none.',
    tags: ['Cross-account merge', 'WhatsApp contacts', 'Safe — preview first'],
    tint: 'contacts',
  },
  {
    icon: <UserX className="h-5 w-5" />,
    title: 'Blank & Junk Contacts',
    desc: 'Surfaces contacts with no name, no number, or only a partial entry — the noise that builds up from years of syncing across phones and SIMs.',
    tags: ['No-number entries', 'Partial contacts', 'SIM leftovers'],
    tint: 'contacts',
  },
]

const AI_EXAMPLES = [
  'How much space are my WhatsApp files taking?',
  'Show me all screenshots from last month',
  'Find videos larger than 100MB I haven’t opened',
  'Which app has the most duplicate downloads?',
]

const AI_DIALOGUE = [
  { role: 'user', text: 'Find all duplicate photos from my camera' },
  {
    role: 'bot',
    text: 'Found 847 duplicate photos — 2.3 GB that can be freed. 312 are burst shots, 280 are WhatsApp forwards saved twice. Want to review them?',
  },
  { role: 'user', text: 'Delete the WhatsApp ones automatically' },
  { role: 'bot', text: '280 files removed. Freed 680 MB. Your originals are untouched.' },
]

/* ───────────────────────────────────────────────────────────────
   TINT HELPERS
   ─────────────────────────────────────────────────────────────── */

const TINTS: Record<
  Feature['tint'],
  { badge: string; icon: string; tag: string; glow: string }
> = {
  media: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: 'from-rose-500/30 to-rose-500/0 text-rose-300',
    tag: 'bg-rose-500/10 text-rose-200/80 border-rose-500/20',
    glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(251,113,133,0.5)]',
  },
  smart: {
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    icon: 'from-orange-500/30 to-orange-500/0 text-orange-300',
    tag: 'bg-orange-500/10 text-orange-200/80 border-orange-500/20',
    glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(251,146,60,0.5)]',
  },
  contacts: {
    badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    icon: 'from-pink-500/30 to-pink-500/0 text-pink-300',
    tag: 'bg-pink-500/10 text-pink-200/80 border-pink-500/20',
    glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)]',
  },
  ai: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: 'from-amber-500/30 to-amber-500/0 text-amber-300',
    tag: 'bg-amber-500/10 text-amber-200/80 border-amber-500/20',
    glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(251,191,36,0.5)]',
  },
}

/* ───────────────────────────────────────────────────────────────
   FEATURE CARD
   ─────────────────────────────────────────────────────────────── */

function FeatureCard({ f }: { f: Feature }) {
  const t = TINTS[f.tint]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`card-glow group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 ${t.glow}`}
    >
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.icon} border border-white/10`}
      >
        {f.icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{f.desc}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {f.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${t.tag}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   CLUSTER HEADER
   ─────────────────────────────────────────────────────────────── */

function ClusterHeader({
  emoji,
  label,
  tint,
}: {
  emoji: string
  label: string
  tint: Feature['tint']
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${TINTS[tint].badge}`}
      >
        <span aria-hidden>{emoji}</span>
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   AI DIALOGUE — typed-out, looping
   ─────────────────────────────────────────────────────────────── */

function AiDialogue() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    if (visibleCount >= AI_DIALOGUE.length) {
      const reset = setTimeout(() => {
        setVisibleCount(0)
        setTypedText('')
      }, 3500)
      return () => clearTimeout(reset)
    }
    const current = AI_DIALOGUE[visibleCount]
    let i = 0
    setTypedText('')
    const typer = setInterval(() => {
      i++
      setTypedText(current.text.slice(0, i))
      if (i >= current.text.length) {
        clearInterval(typer)
        setTimeout(() => setVisibleCount((c) => c + 1), 700)
      }
    }, 22)
    return () => clearInterval(typer)
  }, [visibleCount])

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {AI_DIALOGUE.slice(0, visibleCount).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-br-sm'
                  : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: m.text }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {visibleCount < AI_DIALOGUE.length && (
        <div
          className={`flex ${AI_DIALOGUE[visibleCount].role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              AI_DIALOGUE[visibleCount].role === 'user'
                ? 'bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-br-sm'
                : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-bl-sm'
            }`}
          >
            {typedText}
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   PRIVACY MODAL
   ─────────────────────────────────────────────────────────────── */

function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Privacy Policy"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="modal-scroll relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1A0809] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Privacy Policy
                </h2>
                <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                  Updated May 2026
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 text-sm leading-relaxed text-white/75">
              <section>
                <p>
                  Rahul Pahuja (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the{' '}
                  <strong className="text-white">DeDup</strong> mobile application. Your privacy is
                  fundamental to how we built this app.
                </p>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-300" />
                  <p>
                    <strong className="text-white">Local Processing Guarantee:</strong> All file
                    scanning, hashing, and duplicate detection happen entirely on your device. No
                    file names, contents, or metadata from your storage are ever transmitted to our
                    servers or any third parties.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  1. Information We Collect
                </h3>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>
                    <strong className="text-white/90">Account Data:</strong> If you log in via Google
                    or Facebook, we collect your name, email, and profile picture to personalize
                    your experience.
                  </li>
                  <li>
                    <strong className="text-white/90">Device Information:</strong> Device model, OS
                    version, and unique identifiers via Firebase Analytics to improve app
                    performance.
                  </li>
                  <li>
                    <strong className="text-white/90">Crash Reports:</strong> Firebase Crashlytics
                    collects logs when the app crashes to help us fix bugs.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  2. Permissions &amp; Data Usage
                </h3>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>
                    <strong className="text-white/90">All Files Access (MANAGE_EXTERNAL_STORAGE):</strong>{' '}
                    Allows scanning your entire storage to identify duplicate documents, zip files,
                    and other files consuming space. File hashes are computed locally only.
                  </li>
                  <li>
                    <strong className="text-white/90">Media Permissions (Images, Video, Audio):</strong>{' '}
                    Allows scanning your gallery and music library for duplicates. Used to generate
                    thumbnails and perform comparisons.
                  </li>
                  <li>
                    <strong className="text-white/90">Notifications:</strong> To alert you when
                    storage is running low or a scan is complete.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  3. Third-Party Services
                </h3>
                <p>
                  We use Google Play Services / Firebase (Analytics, Crashlytics, Auth) and the
                  Facebook Login SDK, which may collect data independently.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  4. Your Rights (GDPR &amp; DPDP)
                </h3>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li>
                    <strong className="text-white/90">Access</strong> a copy of your personal data
                  </li>
                  <li>
                    <strong className="text-white/90">Rectification</strong> of inaccurate data
                  </li>
                  <li>
                    <strong className="text-white/90">Erasure</strong> (&ldquo;Right to be
                    Forgotten&rdquo;)
                  </li>
                  <li>
                    <strong className="text-white/90">Data Portability</strong> in a structured
                    format
                  </li>
                  <li>
                    <strong className="text-white/90">Withdraw Consent</strong> for analytics at any
                    time via app settings
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  5. Security
                </h3>
                <p>
                  We use industry-standard encryption (SQLCipher) to protect your local scan history
                  and settings stored on your device.
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-semibold text-white">
                  6. Contact &amp; Grievance Redressal
                </h3>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="font-semibold text-white">Data Protection / Grievance Officer</p>
                  <p className="mt-1">
                    <strong className="text-white/90">Name:</strong> Rahul Pahuja
                  </p>
                  <p>
                    <strong className="text-white/90">Email:</strong>{' '}
                    <a
                      href="mailto:therahulpahuja@gmail.com"
                      className="text-rose-300 underline-offset-4 hover:underline"
                    >
                      therahulpahuja@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong className="text-white/90">Website:</strong>{' '}
                    <a
                      href="https://www.therahulpahuja.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-300 underline-offset-4 hover:underline"
                    >
                      www.therahulpahuja.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────────────────────────────────────────────────────────────
   CINEMATIC SECTION — Apple-style scroll-pinned text overlay
   Each section is full-height; text fades in/out as user scrolls
   through the 3D experience.
   ─────────────────────────────────────────────────────────────── */

function CinematicSection({
  children,
  align = 'center',
}: {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}) {
  const alignClass =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
        ? 'items-end text-right'
        : 'items-center text-center'
  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center px-6">
      <div className={`mx-auto flex w-full max-w-4xl flex-col gap-6 ${alignClass}`}>
        {children}
      </div>
    </section>
  )
}

/* ───────────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
   ─────────────────────────────────────────────────────────────── */

function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed left-0 top-0 z-[150] h-0.5 w-full bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-pink-500 via-orange-400 to-amber-400"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 0.1s linear' }}
      />
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   MAIN PAGE — cinematic scroll experience
   ─────────────────────────────────────────────────────────────── */

export default function DedupPage() {
  const scrollProgress = useRef(0)
  const [progress01, setProgress01] = useState(0)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        // Scroll normalized across the whole document
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        scrollProgress.current = p
        setProgress01(p)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ── BACKGROUND LAYERS ───────────────────────────── */}
      <GeminiAurora />

      {/* 3D scene pinned behind all cinematic content */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <DedupScene scrollRef={scrollProgress} />
      </div>

      {/* Top + bottom fades for text legibility */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#0F0608] to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-[#0F0608] to-transparent" />

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="section-shell flex items-center justify-between">
          <div className="font-display text-xl font-bold tracking-tight text-gradient-white">
            De<span className="text-gradient">Dup</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
            >
              Privacy
            </button>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/55 backdrop-blur-sm sm:inline">
              dedup.space
            </span>
          </div>
        </div>
      </nav>

      <ScrollProgressBar progress={progress01} />

      {/* ── CINEMATIC SCROLL TRACK ──────────────────────── */}
      <div className="relative z-10">
        {/* ── ACT 1: HERO ──────────────────────────────── */}
        <CinematicSection align="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 self-center text-[11px] font-medium uppercase tracking-[0.18em] text-rose-300"
          >
            <span className="h-px w-6 bg-rose-400/60" />
            On-Device · Private · Free
            <span className="h-px w-6 bg-rose-400/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl lg:text-[86px]"
          >
            Clean your phone.
            <br />
            <span className="text-gradient">Keep what matters.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            DeDup finds every duplicate photo, video, and file on your Android — instantly, entirely
            on-device. Your data never leaves your phone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <a
              href="https://play.google.com/store/apps/details?id=com.rp.dedup"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-3d"
            >
              <GooglePlayIcon className="h-[18px] w-[18px]" />
              Get it on Google Play
            </a>
            <div className="btn-secondary-3d">App Store — Coming Soon</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex items-center gap-2 text-xs text-white/50"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Zero cloud uploads. Everything stays on your device.
          </motion.div>
        </CinematicSection>

        {/* ── ACT 2: MERGE CAPTION ─────────────────────── */}
        <CinematicSection align="left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              The merge
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-gradient">Photos. Music. Videos.</span>
              <br />
              APKs. Contacts. Docs.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
              Every kind of duplicate on your phone — burst shots, re-downloaded songs, viral
              WhatsApp videos, leftover APKs, double-saved contacts, cloned PDFs. All found,
              fingerprinted, and merged on-device.
            </p>
          </motion.div>
        </CinematicSection>

        {/* ── ACT 3: REVEAL CAPTION ────────────────────── */}
        <CinematicSection align="right">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              The reveal
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Your storage.
              <br />
              <span className="text-gradient">Crystal clear.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
              DeDup doesn’t just delete — it organises. And with on-device AI, you can ask your
              phone anything about its own storage, in plain language.
            </p>
          </motion.div>
        </CinematicSection>

        {/* ── FEATURE GRID SECTION (after cinematic) ───── */}
        {/* The 3D canvas fades out via the bottom gradient as this content
            begins; section has a more opaque background to remain legible. */}
        <section className="relative bg-[#0F0608]/85 px-6 pb-24 pt-32 backdrop-blur-md">
          <div className="section-shell">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="mb-12 text-center"
            >
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-300">
                What DeDup Does
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[44px]">
                Every kind of clutter.
                <br />
                One app to clear it all.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
                DeDup goes beyond basic duplicate finders — it understands your media, your contacts,
                your chats, and your storage.
              </p>
            </motion.div>

            {/* Media cluster */}
            <div className="mb-16">
              <ClusterHeader emoji="📸" label="Media" tint="media" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {MEDIA_FEATURES.map((f) => (
                  <FeatureCard key={f.title} f={f} />
                ))}
              </div>
            </div>

            {/* Smart Clean cluster */}
            <div className="mb-16">
              <ClusterHeader emoji="🧹" label="Smart Clean" tint="smart" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {SMART_FEATURES.map((f) => (
                  <FeatureCard key={f.title} f={f} />
                ))}
              </div>
            </div>

            {/* Contacts cluster */}
            <div className="mb-16">
              <ClusterHeader emoji="👤" label="Contacts" tint="contacts" />
              <div className="grid gap-5 sm:grid-cols-2">
                {CONTACTS_FEATURES.map((f) => (
                  <FeatureCard key={f.title} f={f} />
                ))}
              </div>
            </div>

            {/* AI Feature — talk to my storage */}
            <div className="mb-4">
              <ClusterHeader emoji="✦" label="AI Feature" tint="ai" />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-rose-500/[0.04] to-transparent p-6 sm:p-10"
              >
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                      <Sparkles className="h-3 w-3" />
                      On-Device AI
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                      Talk to My Storage
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                      Ask your phone questions about its own storage — in plain language. No
                      dashboards to navigate, no folders to dig through. Just ask.
                    </p>
                    <div className="mt-6 space-y-2">
                      {AI_EXAMPLES.map((ex, i) => (
                        <motion.div
                          key={ex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.08 }}
                          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-white/70"
                        >
                          <MessageCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-300" />
                          {ex}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#1A0809]/80 p-5 backdrop-blur-md sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-white/50">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                        DeDup AI · Live demo
                      </div>
                      <Star className="h-3.5 w-3.5 text-amber-300" />
                    </div>
                    <AiDialogue />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────── */}
        <section className="relative bg-[#0F0608]/85 px-6 py-24 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="section-shell relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/[0.1] via-orange-500/[0.05] to-transparent px-6 py-16 text-center sm:px-12 sm:py-20"
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-orange-500/15 blur-3xl" />

            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Your phone. Cleaner. Faster.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              Photos, videos, contacts, WhatsApp clutter — all cleared. Free, private, on-device.
            </p>
            <div className="relative mt-8 flex justify-center">
              <a
                href="https://play.google.com/store/apps/details?id=com.rp.dedup"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-3d"
              >
                <GooglePlayIcon className="h-[18px] w-[18px]" />
                Download Free on Android
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ──────────────────────────────────── */}
        <footer className="relative border-t border-white/[0.06] bg-[#0F0608] px-6 py-10">
          <div className="section-shell flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="font-display text-base font-bold text-gradient-white">DeDup</div>
            <p className="text-center text-xs text-white/45">
              © 2025 Mobile1x ·{' '}
              <a
                href="mailto:therahulpahuja@gmail.com"
                className="text-white/65 underline-offset-4 hover:text-white hover:underline"
              >
                therahulpahuja@gmail.com
              </a>
            </p>
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="text-white/55 transition hover:text-white"
              >
                Privacy
              </button>
              <span className="text-white/55">Terms</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── PRIVACY MODAL ──────────────────────────────── */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </main>
  )
}
