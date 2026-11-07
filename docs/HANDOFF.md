# DeDup website: handoff

Last updated 2026-11-07. Live at https://dedup.space from `main` (Netlify auto-deploys `main`).
Full Phase 3 SEO record: `docs/SEO_PHASE3.md`.

## Current state

- Four feature pages are live: `/ai-storage-cleaner`, `/duplicate-photo-cleaner`, `/duplicate-video-cleaner`, `/whatsapp-cleaner`.
- The homepage has the new headline, feature cards and links to the feature pages.
- 49 blog posts are published, including the 8 SEO articles from 2026-11-07.
- The share image shows "Clean Your Phone. Reclaim Your Storage."
- Every page has its own canonical URL, Open Graph and X tags, and JSON-LD.
- Google Play links carry UTM parameters (`utm_campaign=dedup_seo`).
- Six custom GA4 events are sent (see `src/lib/track.ts` and `src/components/analytics/site-events.tsx`).
- Checks: lint, type-check, tests (46) and the build all pass. The build now fails on type errors.

## Done in Google accounts on 2026-11-07

- **Search Console** (Domain property `dedup.space`):
  - Sitemap `https://dedup.space/sitemap.xml` submitted. It reported "Sitemap submitted successfully" with 57 discovered URLs.
  - Indexing requested for all four feature pages. Before the request, two showed "Discovered, currently not indexed" and two showed "URL is unknown to Google".
- **GA4** (account `dedup-site`, property `dedup-web` 542263760, stream "DeDup Web"): six event-scoped custom dimensions were created.

  | Dimension | Parameter |
  | --- | --- |
  | CTA placement | `placement` |
  | Feature page | `feature` |
  | Session landing page | `landing_page` |
  | Link destination | `to_path` |
  | Article slug | `article_slug` |
  | FAQ question | `question` |

## Next time, in order

1. **Mark `google_play_cta_click` as a key event** in GA4 (Admin → Events → Recent events → star it). On 2026-11-07 the event had not yet appeared, because new events take up to 24 hours to show. Check the list after a real visitor has clicked a Play button.
2. **Check indexing** about a week after 2026-11-07:
   - In Search Console → Pages, confirm the four feature pages are indexed.
   - Look for "Duplicate, Google chose different canonical" on blog posts. The old site-wide canonical bug could have caused it; it should clear after a recrawl.
3. **Real Android screenshots** for duplicate-photo results, duplicate-video results and the WhatsApp cleaner. These need a phone connected over USB with USB debugging; the user preferred not to connect one on 2026-11-07.
   - Put a small set of generated sample media on the phone first, so no personal photos appear.
   - Never use `dedup-ios/goldie/out/raw/iphone-6.9/photos.png`: it shows a real receipt with personal details.
   - Convert each capture to webp at 640 px wide, put it in `public/screens/`, and update `SHOTS` and the pages' `shot` fields in `src/content/landing-pages.ts`.
   - `tests/seo.test.ts` checks that every referenced image exists.
4. **Decide the app name.** The Play title is "DeDup: Duplicate Photo Cleaner" and the site says "AI Storage Cleaner". This is the user's decision. Do not change Play Console from website work.
5. **Older blog guides say 1.5.3.** Some behaviour changed in 1.6.x: Trash staging, WhatsApp sent-copy logic and the WhatsApp delete confirmation. Update those posts in `/admin/blog`, then commit `db/custom.db`.
6. **Homepage mobile performance.** Lighthouse gives 79–86 on warm runs; the Three.js scene is most of the cost. Starting the scene on browser idle scored worse and was reverted. The remaining option is to skip the 3D scene on small screens, which is a design decision.
7. **Optional:** link Search Console to GA4 (GA4 Admin → Product links → Search Console links).

## How to work on it

| Task | Command |
| --- | --- |
| Tests | `bun test tests` |
| Lint | `npx eslint .` |
| Type-check | `npx tsc --noEmit -p .` |
| Build | `npm run build` |
| Run the build locally | `PORT=3100 HOSTNAME=127.0.0.1 node .next/standalone/server.js` |

Before claiming anything about the product, check it against the Android source (`origin/main` of `~/AndroidStudioProjects/dedup/DeDup`). The claims list is in `docs/SEO_PHASE3.md`. In particular:
- WhatsApp statuses are not scanned.
- Photo search matches album, app and date text, not image content.
- The cache cleaner only clears DeDup's own cache.

Do not commit `tsconfig.tsbuildinfo` or `.DS_Store`.
