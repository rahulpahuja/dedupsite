/**
 * Build script — generates procedural PNG assets for the 3D scene
 * into /public/dedup-assets/ with a WARM palette (pink/orange/red).
 */

import { createCanvas } from 'canvas'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { writeFile } from 'fs/promises'

const OUT_DIR = '/home/z/my-project/public/dedup-assets'
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  return Buffer.from(base64, 'base64')
}

async function save(dataUrl, name) {
  const buf = dataUrlToBuffer(dataUrl)
  await writeFile(`${OUT_DIR}/${name}`, buf)
  console.log('✓', name)
}

/* ─── PHOTO — warm sunset/rose/dusk palettes ─────── */

const PHOTO_PALETTES = [
  ['#FECDD3', '#FB7185', '#BE123C'], // rose sunset
  ['#FED7AA', '#FB923C', '#C2410C'], // orange dusk
  ['#FEE2E2', '#F87171', '#7F1D1D'], // cherry
  ['#FFE4E6', '#F43F5E', '#9F1239'], // pink
  ['#FEF3C7', '#F59E0B', '#92400E'], // amber
  ['#FBCFE8', '#EC4899', '#831843'], // magenta
]

function genPhoto(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')
  const pal = PHOTO_PALETTES[seed % PHOTO_PALETTES.length]

  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, pal[0])
  g.addColorStop(0.6, pal[1])
  g.addColorStop(1, pal[2])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  // Sun
  ctx.beginPath()
  ctx.arc(180 - (seed % 60), 60 + (seed % 30), 28, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 240, 220, 0.9)'
  ctx.fill()

  // Mountain silhouette
  ctx.fillStyle = 'rgba(60, 10, 20, 0.55)'
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

  const v = ctx.createRadialGradient(128, 128, 60, 128, 128, 180)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(40,0,10,0.4)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, 256, 256)

  return c.toDataURL('image/png')
}

/* ─── MUSIC — warm album covers ──────────────────── */

const MUSIC_PALETTES = [
  ['#7F1D1D', '#F43F5E'],
  ['#831843', '#FB7185'],
  ['#92400E', '#FB923C'],
  ['#7C2D12', '#FBBF24'],
  ['#9F1239', '#FECDD3'],
  ['#831843', '#F472B6'],
]

function genMusic(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')
  const [bg, accent] = MUSIC_PALETTES[seed % MUSIC_PALETTES.length]

  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, bg)
  g.addColorStop(1, accent)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1.5
  for (let r = 40; r < 130; r += 12) {
    ctx.beginPath()
    ctx.arc(128, 128, r, 0, Math.PI * 2)
    ctx.stroke()
  }

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

/* ─── VIDEO — warm film strips ───────────────────── */

function genVideo(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')
  const palettes = [
    ['#1A0A0A', '#DC2626'],
    ['#2D0A0A', '#F43F5E'],
    ['#1A0808', '#FB923C'],
    ['#2D0F0A', '#EC4899'],
  ]
  const [bg, accent] = palettes[seed % palettes.length]

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 256)

  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, accent)
  g.addColorStop(1, bg)
  ctx.fillStyle = g
  ctx.fillRect(20, 30, 216, 196)

  ctx.fillStyle = '#000'
  for (let x = 20; x < 236; x += 18) {
    ctx.fillRect(x, 8, 10, 14)
    ctx.fillRect(x, 234, 10, 14)
  }

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

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('0:42', 200, 220)

  return c.toDataURL('image/png')
}

/* ─── APK — warm app icons ───────────────────────── */

function genApk(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')
  const palettes = [
    ['#F43F5E', '#9F1239'],
    ['#FB923C', '#9A3412'],
    ['#FBBF24', '#92400E'],
    ['#EC4899', '#831843'],
    ['#F87171', '#7F1D1D'],
    ['#FB7185', '#BE123C'],
  ]
  const [a, b] = palettes[seed % palettes.length]

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

  // Android robot (white)
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(128, 110, 50, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = a
  ctx.beginPath()
  ctx.arc(110, 105, 6, 0, Math.PI * 2)
  ctx.arc(146, 105, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(78, 130, 100, 70)
  ctx.fillRect(92, 200, 14, 30)
  ctx.fillRect(150, 200, 14, 30)

  return c.toDataURL('image/png')
}

/* ─── CONTACT — warm-toned cards ─────────────────── */

const CONTACT_NAMES = ['AK', 'JS', 'MR', 'PL', 'DV', 'NS', 'RT', 'BM']

function genContact(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#FFF5F0'
  ctx.fillRect(0, 0, 256, 256)

  const palettes = ['#F43F5E', '#FB923C', '#EC4899', '#FBBF24', '#F87171', '#FB7185']
  const color = palettes[seed % palettes.length]
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 80)

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(128, 110, 48, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = color
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(CONTACT_NAMES[seed % CONTACT_NAMES.length], 128, 110)

  ctx.fillStyle = '#7F1D1D'
  ctx.fillRect(80, 180, 96, 8)
  ctx.fillStyle = '#9A3412'
  ctx.fillRect(96, 200, 64, 6)
  ctx.fillRect(96, 215, 48, 6)

  return c.toDataURL('image/png')
}

/* ─── DOCUMENT — warm-toned PDFs ─────────────────── */

function genDocument(seed) {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(40, 24, 176, 208)

  ctx.fillStyle = '#FECDD3'
  ctx.beginPath()
  ctx.moveTo(216, 24)
  ctx.lineTo(216, 64)
  ctx.lineTo(176, 24)
  ctx.closePath()
  ctx.fill()

  const accents = ['#DC2626', '#F43F5E', '#FB923C', '#EC4899']
  const accent = accents[seed % accents.length]
  ctx.fillStyle = accent
  ctx.fillRect(60, 60, 100, 10)
  ctx.fillStyle = '#D1B8B0'
  for (let y = 90; y < 200; y += 14) {
    const w = 120 + ((seed + y) % 30)
    ctx.fillRect(60, y, w, 6)
  }

  return c.toDataURL('image/png')
}

/* ─── AI ORB — warm pink/orange glow ─────────────── */

function genAiOrb() {
  const c = createCanvas(256, 256)
  const ctx = c.getContext('2d')

  ctx.clearRect(0, 0, 256, 256)

  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128)
  g.addColorStop(0, 'rgba(251, 146, 60, 0.95)')
  g.addColorStop(0.35, 'rgba(244, 63, 94, 0.75)')
  g.addColorStop(0.75, 'rgba(236, 72, 153, 0.35)')
  g.addColorStop(1, 'rgba(236, 72, 153, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  const nodes = []
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2
    const r = 40 + (i % 3) * 18
    nodes.push([128 + Math.cos(angle) * r, 128 + Math.sin(angle) * r])
  }
  ctx.strokeStyle = 'rgba(255, 240, 230, 0.55)'
  ctx.lineWidth = 1
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.abs(i - j) > 3 && Math.random() > 0.4) continue
      ctx.beginPath()
      ctx.moveTo(nodes[i][0], nodes[i][1])
      ctx.lineTo(nodes[j][0], nodes[j][1])
      ctx.stroke()
    }
  }
  for (const [x, y] of nodes) {
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦', 128, 128)

  return c.toDataURL('image/png')
}

/* ─── RUN ───────────────────────────────────────────── */

async function main() {
  console.log('Generating DeDup 3D scene assets (WARM palette)...\n')

  for (let i = 0; i < 6; i++) await save(genPhoto(i), `photo-${i}.png`)
  for (let i = 0; i < 6; i++) await save(genMusic(i), `music-${i}.png`)
  for (let i = 0; i < 4; i++) await save(genVideo(i), `video-${i}.png`)
  for (let i = 0; i < 6; i++) await save(genApk(i), `apk-${i}.png`)
  for (let i = 0; i < 8; i++) await save(genContact(i), `contact-${i}.png`)
  for (let i = 0; i < 4; i++) await save(genDocument(i), `document-${i}.png`)
  await save(genAiOrb(), `ai-orb.png`)

  console.log('\n✅ All warm-palette assets generated in /public/dedup-assets/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
