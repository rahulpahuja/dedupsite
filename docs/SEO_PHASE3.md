# DeDup website: Phase 3 organic acquisition (SEO)

Branch `feat/seo-phase3`. Last updated 2026-11-07.

## What was added

| Area | Files |
| --- | --- |
| Feature landing pages | `src/app/{ai-storage-cleaner,duplicate-photo-cleaner,duplicate-video-cleaner,whatsapp-cleaner}/page.tsx`, template `src/components/seo/landing-page.tsx`, copy `src/content/landing-pages.ts` |
| Shared header, footer, Play button | `src/components/seo/site-chrome.tsx`, `src/components/brand/store-icons.tsx` |
| Constants, UTM links, JSON-LD builders | `src/lib/site.ts`, `src/components/seo/json-ld.tsx` |
| Conversion events | `src/lib/track.ts`, `src/components/analytics/site-events.tsx` (mounted in `src/app/layout.tsx`) |
| Homepage | `src/app/page.tsx` (server wrapper: metadata, JSON-LD, scene preloads), `src/app/home-client.tsx` (the former `page.tsx`) |
| Blog | `src/app/blog/[slug]/page.tsx` (canonical, Open Graph, Article + BreadcrumbList JSON-LD, Play CTA, same-tab internal links), `src/app/blog/page.tsx` (canonical, description) |
| Sitemap | `src/app/sitemap.ts` (adds the four feature pages) |
| Draft articles | `content/articles/*.md`, loader `scripts/seed-seo-articles.ts` |
| Screenshots | `public/screens/*.webp` (real captures, resized) |
| Tests | `tests/seo.test.ts` |

### Fixed along the way

- The root layout set `alternates.canonical: "/"`, which every page without its own canonical inherited. All blog posts and `/blog` declared the homepage as their canonical URL. Each page now sets its own.
- The root layout preloaded four 3D-scene textures on every page. They are now preloaded on the homepage only, and links to `/` from other pages use `prefetch={false}` so the textures are not fetched in the background.
- The root layout set `og:url` to the homepage for every page. Removed; pages that need it set their own.
- The homepage H1 and intro were faded in by JavaScript, delaying the largest paint until hydration. They now render straight from the HTML.

## Page metadata

| URL | Title | H1 | Structured data |
| --- | --- | --- | --- |
| `/` | DeDup: AI Storage Cleaner – Clean Your Phone, Reclaim Storage | Clean Your Phone. Reclaim Your Storage. | Organization, WebSite, SoftwareApplication |
| `/ai-storage-cleaner` | AI Storage Cleaner for Android: Free Up Phone Storage \| DeDup | An AI storage cleaner that shows you what is filling your phone | SoftwareApplication, BreadcrumbList, FAQPage |
| `/duplicate-photo-cleaner` | Duplicate Photo Cleaner & Similar Photo Finder \| DeDup | Find and remove duplicate and similar photos on Android | SoftwareApplication, BreadcrumbList, FAQPage |
| `/duplicate-video-cleaner` | Duplicate Video Finder & Cleaner for Android \| DeDup | Find duplicate videos on Android and free up storage | SoftwareApplication, BreadcrumbList, FAQPage |
| `/whatsapp-cleaner` | WhatsApp Cleaner for Android: Clean WhatsApp Media \| DeDup | Clean WhatsApp media and storage on Android | SoftwareApplication, BreadcrumbList, FAQPage |
| `/blog/<slug>` | `<post title> — DeDup Blog` | post title | Article, BreadcrumbList |

Descriptions are in `src/content/landing-pages.ts` and `src/app/page.tsx`. Every page has a self-referencing canonical, Open Graph and X card tags, and the default share image. FAQPage markup is only on pages that show the same questions on screen. No ratings, reviews, prices or download counts are published anywhere in the markup.

Note: Google currently shows FAQ rich results mainly for government and health sites, so FAQPage markup is unlikely to produce a rich result here. It is valid and harmless; the visible FAQs are there for readers.

## Claims and where they were verified

All product statements were checked against the Android source for the released version 1.6.2 (`origin/main` of the app repo) on 2026-11-07. Re-check these when the app changes:

- Photo matching: size plus first-64-KB checksum for exact copies; 64-bit dHash for look-alikes; similarity setting 0–20, default 10; EXIF orientation is normalised but rotated pixels are not matched.
- Photo and video deletions are copied to DeDup's Trash before the Android prompt (`TrashStaging`), default retention 30 days.
- Videos: same byte size, or at least 2 of 3 frames (10/50/90%) within 3 bits.
- WhatsApp: Images, Video, Documents and their Sent folders; SHA-256 duplicates; sent copies listed only when an identical received copy exists; large files ≥ 10 MB; **statuses not scanned**; deletes are confirmed then permanent (no Trash).
- Deleting and merging require Google sign-in on Android; guests can scan.
- Photo search matches album, app and date text, **not image content**. ML Kit image labelling is used for screenshot / meme / receipt sorting only.
- The cache cleaner clears **DeDup's own cache** only.

Copy deliberately avoids: "no account needed", rotated-copy detection, status cleaning, cleaning other apps' caches, image-content search.

## Analytics events

Sent through the existing gtag.js tag (G-E6B5M8JKHP). No new SDK.

| Event | When | Parameters |
| --- | --- | --- |
| `landing_page_view` | First page of a browser session | `page_path`, `landing_page`, `referrer_host`, `utm_*`, `device_category` |
| `feature_page_view` | Each of the four feature pages | `page_path`, `feature`, + session context |
| `article_view` | `/blog/<slug>` | `page_path`, `article_slug`, + session context |
| `google_play_cta_click` | Click on any play.google.com link | `page_path`, `placement` (data-cta or utm_content), + session context |
| `internal_page_navigation` | Click on a same-site link to another page | `page_path`, `to_path`, `placement`, + session context |
| `faq_expand` | Opening a FAQ item | `page_path`, `question`, + session context |

"Session context" = `landing_page`, `referrer_host`, `utm_*` captured at the start of the visit (sessionStorage) and `device_category`. No personal data is collected: the referrer is reduced to its host, UTM values are truncated, and no query strings or identifiers are sent. GA's automatic `page_view` is untouched; none of these events duplicates it.

All Google Play links use `utm_source=website&utm_medium=organic&utm_campaign=dedup_seo&utm_content=<placement>`.

**To do in GA4** (Admin → Custom definitions): register event-scoped custom dimensions for `placement`, `feature`, `landing_page`, `to_path`, `question`, `article_slug` if you want them in reports. Mark `google_play_cta_click` as a key event.

## Draft articles (not published)

Eight drafts are in the blog database with `published = false`. They are not built into the site and return 404 until published.

1. How to Find and Remove Duplicate Photos on Android — `find-and-remove-duplicate-photos-android`
2. How to Find Similar Photos on Your Android Phone — `find-similar-photos-android`
3. How to Find Duplicate Videos and Free Up Storage — `find-duplicate-videos-free-up-storage`
4. How to Clean WhatsApp Storage on Android — `clean-whatsapp-storage-android`
5. Why Does Android Phone Storage Fill Up So Quickly? — `why-android-storage-fills-up`
6. How to Find Duplicate Files with Different Names — `find-duplicate-files-different-names`
7. How to Organize Android Storage Without Losing Important Files — `organize-android-storage-safely`
8. How On-Device Photo Analysis Protects Your Privacy — `on-device-photo-analysis-privacy`

Source of truth: `content/articles/*.md`. To review: run the site locally, open `/admin/blog`, edit, then tick Published (sets `publishedAt`), and commit `db/custom.db`. After editing a Markdown file, `bun scripts/seed-seo-articles.ts --update` refreshes drafts that are still unpublished. It never changes a published post.

## Google Search Console

The code has no verification meta tag, so the property is either verified by DNS or not set up. Steps:

1. Open https://search.google.com/search-console and sign in with the Google account that should own the property.
2. If `dedup.space` is not listed: Add property → **Domain** → `dedup.space`, then add the TXT record it shows to the domain's DNS and press Verify.
3. Sitemaps (left menu) → enter `sitemap.xml` → Submit. Status should become "Success" with about 49 discovered URLs (45 + 4 new pages; the count grows as drafts are published).
4. URL Inspection → paste each new URL (`https://dedup.space/ai-storage-cleaner`, `/duplicate-photo-cleaner`, `/duplicate-video-cleaner`, `/whatsapp-cleaner`) → **Request indexing**.
5. After a few days, check Pages (indexing report) for "Duplicate, Google chose different canonical" on blog posts, which the old site-wide canonical could have caused; they should clear after recrawl.
6. Optional: link Search Console to the GA4 web property (GA4 Admin → Product links → Search Console).

Nothing has been submitted, and no page has been verified as indexed.

## Deployment

Netlify deploys `main` automatically.

1. Review the branch (`git diff main...feat/seo-phase3`) and the drafts in `/admin`.
2. Merge `feat/seo-phase3` into `main` (PR or fast-forward) and push. Netlify builds with `npx prisma generate && npm run build`.
3. After deploy: open the four new URLs, view source to confirm the canonical and JSON-LD, run Google's Rich Results Test on one landing page, then do the Search Console steps above.

## Open items

- **App name mismatch.** The live Play title is "DeDup: Duplicate Photo Cleaner"; the site positions DeDup as "AI Storage Cleaner". The site does not quote the store title, but decide which name both should use.
- **Missing screenshots.** No real Android captures exist for duplicate-photo results, duplicate-video results or the WhatsApp cleaner. Pages use the dashboard, optimize, file-cleanup, insights and similarity-setting screens, and the iPhone video scanner (labelled as iPhone). The iPhone photo-results capture was not used because it shows a real receipt with personal details. Capture new Android screens with sample media and swap them into `src/content/landing-pages.ts`.
- **Share image** (`src/app/opengraph-image.png`) still carries the old tagline "Keep what matters"; update the artwork if the new headline sticks.
- **Homepage performance.** Lighthouse mobile: 79–86 on warm runs, 40 on the first (cold) run; the Three.js scene chunk (~895 KB uncompressed) dominates main-thread time. Options: start the scene only after idle, or not on small screens. This is a design decision, so it was left as is.
- **Version labels.** Existing blog guides say 1.5.3; behaviour that changed in 1.6.x (Trash staging, WhatsApp sent-copy logic, WhatsApp delete confirmation) makes some of those posts out of date.
- Lint: 3 errors and 4 warnings exist on `main` in files not touched here (`use-mobile.ts`, `carousel.tsx`, admin blog page, unused disable directives). Type-check: 3 errors in `examples/` and `scripts/gen-assets.ts` (missing optional modules), also pre-existing. `next.config.ts` still has `ignoreBuildErrors: true`.
