'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { PRIVACY_POLICY_UPDATED, PrivacyPolicyContent } from '@/components/privacy-policy'
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
  X,
  PieChart,
  Search,
  Lock,
} from 'lucide-react'
import { AppleIcon, GooglePlayIcon } from '@/components/brand/store-icons'
import { APP_STORE_URL, FEATURE_PAGES, playStoreUrl } from '@/lib/site'

// 3D scene is loaded only on client (Three.js needs window)
const DedupScene = dynamic(() => import('@/components/three/DedupScene'), {
  ssr: false,
})
const GeminiAurora = dynamic(() => import('@/components/dedup/GeminiAurora'), {
  ssr: false,
})

/* ───────────────────────────────────────────────────────────────
   DATA — feature cards (shown AFTER the cinematic reveal)
   ─────────────────────────────────────────────────────────────── */

type Feature = {
  icon: React.ReactNode
  title: string
  desc: string
  tags: string[]
  /** Which app has the feature. The iPhone app only sees the Photos library and Contacts. */
  platforms: 'Android' | 'Android & iPhone'
  tint: 'media' | 'smart' | 'contacts' | 'ai'
  /** Page with more detail, when there is one. */
  href?: string
}

const MEDIA_FEATURES: Feature[] = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: 'Duplicate Photo Cleaner',
    desc: 'Finds copies and near-identical shots — burst photos, multiple saves, edited vs. original. Compares perceptual fingerprints, computed on your device.',
    tags: ['Copies', 'Near-duplicate', 'Burst shots'],
    platforms: 'Android & iPhone',
    tint: 'media',
    href: '/duplicate-photo-cleaner',
  },
  {
    icon: <Film className="h-5 w-5" />,
    title: 'Duplicate Video Cleaner',
    desc: 'Finds duplicate video files, including re-downloads and re-encoded or different-quality copies. Preview a video before you delete it.',
    tags: ['Re-downloads', 'Re-encoded copies', 'Preview first'],
    platforms: 'Android & iPhone',
    tint: 'media',
    href: '/duplicate-video-cleaner',
  },
  {
    icon: <Music className="h-5 w-5" />,
    title: 'File Cleaner',
    desc: 'Finds duplicate PDFs, documents, archives and other files. Files are grouped by size and name, or by contents on a deep scan.',
    tags: ['PDFs', 'Documents', 'Archives'],
    platforms: 'Android',
    tint: 'media',
    href: '/ai-storage-cleaner',
  },
]

const SMART_FEATURES: Feature[] = [
  {
    icon: <MessagesSquare className="h-5 w-5" />,
    title: 'WhatsApp Cleaner',
    desc: 'Scans the images, videos and documents WhatsApp has saved. Finds identical copies, media you sent that you also received, and files over 10 MB. You choose what to delete.',
    tags: ['Duplicate media', 'Sent copies', 'Large files'],
    platforms: 'Android',
    tint: 'smart',
    href: '/whatsapp-cleaner',
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: 'Screenshots & Receipts',
    desc: 'Sorts your 1,000 most recent photos into groups such as screenshots, memes, receipts and documents, and blurry or poorly exposed shots. You pick what to remove. On iPhone, review categories cover screenshots and blurry photos.',
    tags: ['Screenshots', 'Receipts & docs', 'Blurry shots'],
    platforms: 'Android',
    tint: 'smart',
  },
  {
    icon: <Download className="h-5 w-5" />,
    title: 'Downloads Clean-up',
    desc: 'Finds duplicate APKs, leftover install packages, re-downloaded files, and downloads older than 3 months. You choose what to remove.',
    tags: ['Duplicate APKs', 'Re-downloads', 'Install leftovers'],
    platforms: 'Android',
    tint: 'smart',
  },
]

const STORAGE_FEATURES: Feature[] = [
  {
    icon: <PieChart className="h-5 w-5" />,
    title: 'Smart Storage Analyzer',
    desc: 'Storage Insights shows used and free space and a storage health score out of 100. The storage map draws your folders as blocks sized by how much they hold, so you can see where space went.',
    tags: ['Health score', 'Storage map', 'Large files'],
    platforms: 'Android',
    tint: 'smart',
    href: '/ai-storage-cleaner',
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: 'Smart Photo Search',
    desc: 'Search your photos in plain words by the album, app or date they came from, such as “WhatsApp March 2024”. The matching runs on your phone. It does not look at what is in the picture.',
    tags: ['By album', 'By app', 'By date'],
    platforms: 'Android',
    tint: 'smart',
    href: '/blog/android-1-5-3-search-photos-by-album-app-or-date',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Privacy',
    desc: 'Scanning, matching, photo labelling and contact matching run on your phone. Your photos, files and contacts are not uploaded. The app uses Firebase for sign-in, crash reports and usage analytics.',
    tags: ['On-device scans', 'No ads', 'Delete your account in-app'],
    platforms: 'Android & iPhone',
    tint: 'contacts',
    href: '/privacy',
  },
]

const CONTACTS_FEATURES: Feature[] = [
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Duplicate Contact Merger',
    desc: 'Finds contacts saved more than once, matched by the same name or phone number. You preview the merge and can untick anything you don’t want to keep. The numbers and emails of the others are copied onto the contact you keep.',
    tags: ['Same name or number', 'Preview first', 'Copies numbers & emails'],
    platforms: 'Android & iPhone',
    tint: 'contacts',
  },
]

// Request styles VoiceQueryParser handles (size, date and type filters).
const AI_EXAMPLES = [
  'Show me videos larger than 100 MB from last month',
  'Find screenshots smaller than 5 MB',
  'All images from last week',
  'Videos bigger than 1 GB added this year',
]

/* ───────────────────────────────────────────────────────────────
   TINT HELPERS
   ─────────────────────────────────────────────────────────────── */

type Tint = { badge: string; icon: string; tag: string; glow: string }

// Sky is the brand accent for content; Scan Cyan is kept for the AI feature only.
const SKY_TINT: Tint = {
  badge: 'bg-sky/15 text-sky border-sky/30',
  icon: 'from-sky/30 to-sky/0 text-sky',
  tag: 'bg-sky/10 text-sky/80 border-sky/20',
  glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(95,163,255,0.5)]',
}

const TINTS: Record<Feature['tint'], Tint> = {
  media: SKY_TINT,
  smart: SKY_TINT,
  contacts: SKY_TINT,
  ai: {
    badge: 'bg-scan/15 text-scan border-scan/30',
    icon: 'from-scan/30 to-scan/0 text-scan',
    tag: 'bg-scan/10 text-scan/80 border-scan/20',
    glow: 'group-hover:shadow-[0_0_50px_-12px_rgba(0,229,255,0.45)]',
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
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.icon} border border-white/10`}
        >
          {f.icon}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/60">
          {f.platforms}
        </span>
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
      {f.href && (
        <Link
          href={f.href}
          data-cta="home_feature_card"
          className="mt-5 inline-block text-sm font-medium text-sky underline-offset-4 hover:text-white hover:underline"
        >
          Learn more<span className="sr-only"> about {f.title}</span> →
        </Link>
      )}
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
            className="modal-scroll relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0D2347] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Privacy Policy
                </h2>
                <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                  Updated {PRIVACY_POLICY_UPDATED}
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

            <PrivacyPolicyContent />
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
        className="h-full origin-left bg-gradient-to-r from-ocean via-sky to-scan"
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
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#060D1F] to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t from-[#060D1F] to-transparent" />

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="section-shell flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <a
              href="/blog"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
            >
              Blog
            </a>
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
            className="inline-flex items-center gap-3 self-center text-[11px] font-medium uppercase tracking-[0.18em] text-sky"
          >
            <span className="h-px w-6 bg-sky/60" />
            On-Device · Private · Free
            <span className="h-px w-6 bg-sky/60" />
          </motion.div>

          {/* Not animated in: the heading is the largest above-the-fold element, so it is
              painted straight from the server HTML instead of waiting for hydration. */}
          <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl lg:text-[86px]">
            Clean Your Phone.
            <br />
            <span className="text-gradient">Reclaim Your Storage.</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Find duplicate photos, similar images, repeated videos and unnecessary files with DeDup —
            your AI-powered storage cleaner.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <a
              href={playStoreUrl('home_hero')}
              target="_blank"
              rel="noopener noreferrer"
              data-cta="home_hero"
              className="btn-primary-3d"
            >
              <GooglePlayIcon className="h-[18px] w-[18px]" />
              Download on Google Play
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Explore Features
            </a>
          </motion.div>

          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/55 underline-offset-4 hover:text-white hover:underline"
          >
            <AppleIcon className="h-3.5 w-3.5" />
            Also on iPhone: download on the App Store
          </a>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex items-center gap-2 text-xs text-white/50"
          >
            <Shield className="h-3.5 w-3.5 text-keep" />
            Your photos and files stay on your phone.
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-semibold text-sky">
              <span className="h-1.5 w-1.5 rounded-full bg-sky" />
              The merge
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-gradient">Photos. Music. Videos.</span>
              <br />
              APKs. Contacts. Docs.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
              Burst shots, repeat saves, copied videos, WhatsApp media, leftover APKs, double-saved
              contacts and duplicate PDFs. Scanning and matching happen on your device.
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-xs font-semibold text-sky">
              <span className="h-1.5 w-1.5 rounded-full bg-sky" />
              The reveal
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Your storage.
              <br />
              <span className="text-gradient">Crystal clear.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
              DeDup shows its work. You can also find files by voice or text, for example “videos
              larger than 100 MB from last month”.
            </p>
          </motion.div>
        </CinematicSection>

        {/* ── FEATURE GRID SECTION (after cinematic) ───── */}
        {/* The 3D canvas fades out via the bottom gradient as this content
            begins; section has a more opaque background to remain legible. */}
        <section id="features" className="relative scroll-mt-16 bg-[#060D1F]/85 px-6 pb-24 pt-32 backdrop-blur-md">
          <div className="section-shell">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="mb-12 text-center"
            >
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky">
                What DeDup Does
              </div>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[44px]">
                Every kind of clutter.
                <br />
                One app to clear it all.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
                DeDup finds duplicates and unnecessary files across your media, WhatsApp, downloads
                and contacts, and shows where your storage went. Each card shows which app has the
                feature.
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

            {/* Storage, search and privacy cluster */}
            <div className="mb-16">
              <ClusterHeader emoji="📊" label="Storage & Privacy" tint="smart" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {STORAGE_FEATURES.map((f) => (
                  <FeatureCard key={f.title} f={f} />
                ))}
              </div>
            </div>

            {/* Contacts cluster */}
            <div className="mb-16">
              <ClusterHeader emoji="👤" label="Contacts" tint="contacts" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {CONTACTS_FEATURES.map((f) => (
                  <FeatureCard key={f.title} f={f} />
                ))}
              </div>
            </div>

            {/* AI Feature — talk to my storage */}
            <div className="mb-4">
              <ClusterHeader emoji="✦" label="Ask Your Storage" tint="ai" />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7 }}
                className="overflow-hidden rounded-2xl border border-scan/20 bg-gradient-to-br from-sky/[0.08] via-ocean/[0.06] to-transparent p-6 sm:p-10"
              >
                <div>
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-scan/30 bg-scan/10 px-3 py-1 text-xs font-medium text-scan">
                      <Sparkles className="h-3 w-3" />
                      Voice or text search
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                      Talk to My Storage
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                      Ask for files by size, type, date or name, by voice or by typing. DeDup turns your
                      request into filters on the media on your phone and lists what matches. Words
                      like &ldquo;last month&rdquo; mean the last 30 days. This is on Android; the
                      iPhone assistant answers questions such as &ldquo;show my largest videos&rdquo;.
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
                          <MessageCircle className="h-3.5 w-3.5 flex-shrink-0 text-scan" />
                          {ex}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────── */}
        <section className="relative bg-[#060D1F]/85 px-6 py-24 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="section-shell relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ocean/20 via-sky/[0.06] to-transparent px-6 py-16 text-center sm:px-12 sm:py-20"
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-ocean/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-sky/15 blur-3xl" />

            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Storage full again?
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              DeDup finds duplicate photos and videos on your phone (and files on Android) and shows you what it would remove first. Free today. No ads.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3.5">
              <a
                href={playStoreUrl('home_footer_cta')}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="home_footer_cta"
                className="btn-primary-3d"
              >
                <GooglePlayIcon className="h-[18px] w-[18px]" />
                Download on Google Play
              </a>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-3d"
              >
                <AppleIcon className="h-[18px] w-[18px]" />
                Download Free on iPhone
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ──────────────────────────────────── */}
        <footer className="relative border-t border-white/[0.06] bg-[#060D1F] px-6 py-10">
          <div className="section-shell flex flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
            <BrandLogo />
            <p className="text-center text-xs text-white/45">
              © 2026 Rahul Pahuja, Mobile1x ·{' '}
              <a
                href="mailto:therahulpahuja@gmail.com"
                className="text-white/65 underline underline-offset-4 hover:text-white"
              >
                therahulpahuja@gmail.com
              </a>
            </p>
            <nav aria-label="Features" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              {FEATURE_PAGES.map((p) => (
                <Link key={p.path} href={p.path} className="text-white/55 transition hover:text-white">
                  {p.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="text-white/55 transition hover:text-white"
              >
                Privacy
              </button>
              <Link href="/terms" className="text-white/55 transition hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* ── PRIVACY MODAL ──────────────────────────────── */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </main>
  )
}
