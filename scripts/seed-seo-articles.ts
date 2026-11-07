/**
 * Adds the SEO articles in content/articles/*.md to the blog database as DRAFTS (published=false).
 * Drafts are not built into the public site; review and publish them in /admin.
 *
 *   bun scripts/seed-seo-articles.ts           # insert missing drafts
 *   bun scripts/seed-seo-articles.ts --update  # also refresh drafts that are still unpublished
 *
 * A post that already exists and is published is never touched.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'

const DIR = join(process.cwd(), 'content/articles')
const update = process.argv.includes('--update')
const db = new PrismaClient()

type Article = { slug: string; title: string; excerpt: string; tags: string; topic: string; content: string }

export function parseArticle(slug: string, raw: string): Article {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${slug}: missing front matter`)
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  for (const k of ['title', 'excerpt', 'tags', 'topic']) {
    if (!meta[k]) throw new Error(`${slug}: front matter needs "${k}"`)
  }
  return { slug, title: meta.title, excerpt: meta.excerpt, tags: meta.tags, topic: meta.topic, content: m[2].trim() + '\n' }
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()
  for (const file of files) {
    const a = parseArticle(file.replace(/\.md$/, ''), readFileSync(join(DIR, file), 'utf8'))
    const existing = await db.post.findUnique({ where: { slug: a.slug } })
    if (existing?.published) {
      console.log(`skip (published): ${a.slug}`)
    } else if (existing && !update) {
      console.log(`skip (draft exists): ${a.slug}`)
    } else if (existing) {
      await db.post.update({ where: { slug: a.slug }, data: { title: a.title, excerpt: a.excerpt, tags: a.tags, topic: a.topic, content: a.content } })
      console.log(`updated draft: ${a.slug}`)
    } else {
      await db.post.create({ data: { ...a, published: false, publishedAt: null } })
      console.log(`created draft: ${a.slug}`)
    }
  }
}

if (import.meta.main) {
  main()
    .catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
    .finally(() => db.$disconnect())
}
