/**
 * Generate procedural canvas textures for the 3D scene.
 * Each function returns a data URL we can load into THREE.TextureLoader.
 * No external network fetches — keeps the build self-contained.
 */

import { createCanvas } from 'canvas'

export type Category =
  | 'photo'
  | 'music'
  | 'video'
  | 'apk'
  | 'contact'
  | 'document'
  | 'ai'

/* ───────────────────────────────────────────────────────────────
   PHOTO — small image-like gradient thumbnails with "subject"
   blobs, mimicking real photo thumbnails
   ─────────────────────────────────────────────────────────────── */

const PHOTO_PALETTES: [string, string, string][] = [
  ['#FCD34D', '#F97316', '#DC2626'], // sunset
  ['#A7F3D0', '#10B981', '#047857'], // forest
  ['#BFDBFE', '#3B82F6', '#1E3A8A'], // sky
  ['#FBCFE8', '#EC4899', '#9D174D'], // rose
  ['#FEF3C7', '#F59E0B', '#78350F'], // desert
  ['#DDD6FE', '#8B5CF6', '#4C1D95'], // lavender
  ['#FECACA', '#EF4444', '#7F1D1D'], // cherry
  ['#BBF7D0', '#22C55E', '#14532D'], // moss
]

export function genPhoto(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!
  const pal = PHOTO_PALETTES[seed % PHOTO_PALETTES.length]

  // Sky/background gradient
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, pal[0])
  g.addColorStop(0.6, pal[1])
  g.addColorStop(1, pal[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  // Sun/moon circle
  ctx.beginPath()
  ctx.arc(180 - (seed % 60), 60 + (seed % 30), 28, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fill()

  // Mountain/horizon silhouette
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.beginPath()
  ctx.moveTo(0, 200)
  ctx.lineTo(60, 150)
  ctx.lineTo(110, 185)
  ctx.lineTo(170, 130)
  ctx.lineTo(220, 175)
  ctx.lineTo(256, 160)
  ctx.lineTo(256, 256)
  ctx.lineTo(0, 256)
  ctx.closePath()
  ctx.fill()

  // Subtle vignette
  const v = ctx.createRadialGradient(128, 128, 60, 128, 128, 180)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, 256, 256)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   MUSIC — album-cover style with note glyph
   ─────────────────────────────────────────────────────────────── */

const MUSIC_PALETTES: [string, string][] = [
  ['#1E1B4B', '#7C3AED'],
  ['#831843', '#F472B6'],
  ['#064E3B', '#34D399'],
  ['#7C2D12', '#FB923C'],
  ['#0C4A6E', '#38BDF8'],
  ['#581C87', '#C084FC'],
]

export function genMusic(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!
  const [bg, accent] = MUSIC_PALETTES[seed % MUSIC_PALETTES.length]

  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, bg)
  g.addColorStop(1, accent)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  // Decorative concentric circles (like a vinyl)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1.5
  for (let r = 40; r < 130; r += 12) {
    ctx.beginPath()
    ctx.arc(128, 128, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Music note glyph
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(100, 160, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(170, 140, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(120, 80, 8, 100)
  ctx.fillRect(190, 60, 8, 100)
  ctx.fillRect(120, 75, 78, 10)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   VIDEO — film-strip style with play triangle
   ─────────────────────────────────────────────────────────────── */

export function genVideo(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!
  const palettes: [string, string][] = [
    ['#0F172A', '#1E40AF'],
    ['#1A1A1A', '#DC2626'],
    ['#0C4A6E', '#0EA5E9'],
    ['#3B0764', '#A855F7'],
  ]
  const [bg, accent] = palettes[seed % palettes.length]

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 256)

  // Inner frame (the "video" content)
  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, accent)
  g.addColorStop(1, bg)
  ctx.fillStyle = g
  ctx.fillRect(20, 30, 216, 196)

  // Film perforations top + bottom
  ctx.fillStyle = '#000'
  for (let x = 20; x < 236; x += 18) {
    ctx.fillRect(x, 8, 10, 14)
    ctx.fillRect(x, 234, 10, 14)
  }

  // Play triangle (white circle + triangle)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.beginPath()
  ctx.arc(128, 128, 50, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.moveTo(112, 100)
  ctx.lineTo(112, 156)
  ctx.lineTo(158, 128)
  ctx.closePath()
  ctx.fill()

  // Timestamp
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('0:42', 200, 220)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   APK — Android app icon style (rounded square + glyph)
   ─────────────────────────────────────────────────────────────── */

export function genApk(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!
  const palettes: [string, string][] = [
    ['#22C55E', '#15803D'],
    ['#3B82F6', '#1E40AF'],
    ['#F59E0B', '#B45309'],
    ['#EC4899', '#9D174D'],
    ['#8B5CF6', '#5B21B6'],
    ['#06B6D4', '#0E7490'],
  ]
  const [a, b] = palettes[seed % palettes.length]

  // Rounded square background
  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  ctx.fillStyle = g
  const r = 56
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(256 - r, 0)
  ctx.quadraticCurveTo(256, 0, 256, r)
  ctx.lineTo(256, 256 - r)
  ctx.quadraticCurveTo(256, 256, 256 - r, 256)
  ctx.lineTo(r, 256)
  ctx.quadraticCurveTo(0, 256, 0, 256 - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Android robot glyph (simplified)
  ctx.fillStyle = '#FFFFFF'
  // Head dome
  ctx.beginPath()
  ctx.arc(128, 110, 50, Math.PI, 0)
  ctx.fill()
  // Eyes
  ctx.fillStyle = a
  ctx.beginPath()
  ctx.arc(110, 105, 6, 0, Math.PI * 2)
  ctx.arc(146, 105, 6, 0, Math.PI * 2)
  ctx.fill()
  // Body
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(78, 130, 100, 70)
  // Legs
  ctx.fillRect(92, 200, 14, 30)
  ctx.fillRect(150, 200, 14, 30)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   CONTACT — person card with avatar circle + initials
   ─────────────────────────────────────────────────────────────── */

const CONTACT_NAMES = ['AK', 'JS', 'MR', 'PL', 'DV', 'NS', 'RT', 'BM']

export function genContact(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!

  // Card background
  ctx.fillStyle = '#F8FAFC'
  ctx.fillRect(0, 0, 256, 256)

  // Top color band
  const palettes = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6']
  const color = palettes[seed % palettes.length]
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 80)

  // Avatar circle
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(128, 110, 48, 0, Math.PI * 2)
  ctx.fill()

  // Initials inside avatar
  ctx.fillStyle = color
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(CONTACT_NAMES[seed % CONTACT_NAMES.length], 128, 110)

  // Name lines (placeholder bars)
  ctx.fillStyle = '#1F2937'
  ctx.fillRect(80, 180, 96, 8)
  ctx.fillStyle = '#9CA3AF'
  ctx.fillRect(96, 200, 64, 6)
  ctx.fillRect(96, 215, 48, 6)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   DOCUMENT — PDF/page icon with folded corner
   ─────────────────────────────────────────────────────────────── */

export function genDocument(seed: number): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!

  // Page background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(40, 24, 176, 208)

  // Folded corner
  ctx.fillStyle = '#D1D5DB'
  ctx.beginPath()
  ctx.moveTo(216, 24)
  ctx.lineTo(216, 64)
  ctx.lineTo(176, 24)
  ctx.closePath()
  ctx.fill()

  // Text lines (red header + gray body)
  const accent = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][seed % 4]
  ctx.fillStyle = accent
  ctx.fillRect(60, 60, 100, 10)
  ctx.fillStyle = '#9CA3AF'
  for (let y = 90; y < 200; y += 14) {
    const w = 120 + ((seed + y) % 30)
    ctx.fillRect(60, y, w, 6)
  }

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   AI — glowing orb with neural network pattern
   ─────────────────────────────────────────────────────────────── */

export function genAiOrb(): string {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')!

  // Transparent background
  ctx.clearRect(0, 0, 256, 256)

  // Outer glow
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128)
  g.addColorStop(0, 'rgba(167, 139, 250, 0.95)')
  g.addColorStop(0.4, 'rgba(99, 102, 241, 0.7)')
  g.addColorStop(0.8, 'rgba(56, 189, 248, 0.3)')
  g.addColorStop(1, 'rgba(56, 189, 248, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  // Neural-network nodes + connections
  const nodes: [number, number][] = []
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2
    const r = 40 + (i % 3) * 18
    nodes.push([128 + Math.cos(angle) * r, 128 + Math.sin(angle) * r])
  }
  // Connections
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.lineWidth = 1
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.5) continue
      ctx.beginPath()
      ctx.moveTo(nodes[i][0], nodes[i][1])
      ctx.lineTo(nodes[j][0], nodes[j][1])
      ctx.stroke()
    }
  }
  // Nodes
  for (const [x, y] of nodes) {
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Center sparkle
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', 128, 128)

  return c.toDataURL('image/png')
}

/* ───────────────────────────────────────────────────────────────
   GENERATE ALL — call once at module load, returns a map
   ─────────────────────────────────────────────────────────────── */

export type AssetBundle = {
  photos: string[]
  music: string[]
  videos: string[]
  apks: string[]
  contacts: string[]
  documents: string[]
  ai: string
}

export function generateAllAssets(): AssetBundle {
  return {
    photos: [0, 1, 2, 3, 4, 5].map(genPhoto),
    music: [0, 1, 2, 3, 4, 5].map(genMusic),
    videos: [0, 1, 2, 3].map(genVideo),
    apks: [0, 1, 2, 3, 4, 5].map(genApk),
    contacts: [0, 1, 2, 3, 4, 5, 6, 7].map(genContact),
    documents: [0, 1, 2, 3].map(genDocument),
    ai: genAiOrb(),
  }
}
