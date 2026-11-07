import type { FeaturePath } from '@/lib/site'

/**
 * Copy for the four feature landing pages.
 *
 * Every product statement here was checked against the DeDup Android source code for the released
 * version (1.6.2, origin/main) on 2026-11-07. When the app changes, re-check the statements marked
 * in docs/SEO_PHASE3.md before editing this file. Screenshots are real captures from the apps;
 * none are mock-ups.
 */

export type Shot = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export type Faq = { q: string; a: string }

export type Section = {
  h2: string
  paragraphs?: string[]
  bullets?: string[]
  subsections?: { h3: string; text: string }[]
  shot?: Shot
}

export type LandingContent = {
  path: FeaturePath
  /** Breadcrumb and link label. */
  label: string
  /** <title>; the layout does not append anything. */
  title: string
  description: string
  eyebrow: string
  h1: string
  intro: string[]
  hero: Shot
  sections: Section[]
  faqs: Faq[]
  /** Published blog posts that go deeper on this page's topic. */
  guides: { href: string; label: string }[]
  /** Short line used on the homepage and in "related" links. */
  teaser: string
}

const SHOTS = {
  dashboard: {
    src: '/screens/android-dashboard.webp',
    alt: 'DeDup Android dashboard with the Talk to My Storage assistant and Quick Scan tiles for Images, Videos, Documents and APKs',
    caption: 'Dashboard: start a scan by type, or ask the storage assistant.',
    width: 640,
    height: 1428,
  },
  insights: {
    src: '/screens/android-storage-insights.webp',
    alt: 'DeDup Storage Insights screen showing used space, a storage health score out of 100 and the activity log',
    caption: 'Storage Insights: used space, a health score and what DeDup has cleaned.',
    width: 640,
    height: 1428,
  },
  optimize: {
    src: '/screens/android-optimize.webp',
    alt: 'DeDup Optimize screen listing Smart AI Cleanup, WhatsApp cleaner, empty folders, storage map, cache files, large file review and similar images',
    caption: 'Optimize: WhatsApp cleaner, empty folders, storage map and more.',
    width: 640,
    height: 1428,
  },
  fileCleanup: {
    src: '/screens/android-file-cleanup.webp',
    alt: 'DeDup File Cleanup screen with PDF and APK scanners and a large file finder set to files over 100 MB',
    caption: 'File Cleanup: duplicate PDFs and APKs, plus a large file finder.',
    width: 640,
    height: 1428,
  },
  threshold: {
    src: '/blog/android-1-5-3-similarity-threshold/dlg-threshold.webp',
    alt: 'DeDup Image Similarity setting with a slider set to 10 bits; lower is stricter, higher is more relaxed',
    caption: 'Similarity setting: lower is stricter, higher catches looser matches.',
    width: 720,
    height: 1438,
  },
  iphoneVideo: {
    src: '/screens/iphone-video-scanner.webp',
    alt: 'DeDup Video Scanner on iPhone after a scan, reporting that the gallery is clean and explaining that videos are compared frame by frame',
    caption: 'Video Scanner (iPhone app shown): videos are compared frame by frame.',
    width: 640,
    height: 1385,
  },
} satisfies Record<string, Shot>

export const LANDING_PAGES: Record<FeaturePath, LandingContent> = {
  '/ai-storage-cleaner': {
    path: '/ai-storage-cleaner',
    label: 'AI Storage Cleaner',
    title: 'AI Storage Cleaner for Android: Free Up Phone Storage | DeDup',
    description:
      'DeDup is an Android storage cleaner that shows what is filling your phone, finds duplicate photos, videos and files, and lets you review everything before it is removed.',
    eyebrow: 'Android storage cleaner',
    h1: 'An AI storage cleaner that shows you what is filling your phone',
    intro: [
      'When Android says storage is almost full, the hard part is knowing what to remove. DeDup scans your phone for the things that usually waste space, such as duplicate photos and videos, repeated downloads, old install files and WhatsApp copies, and lists them so you can decide.',
      'Scanning, fingerprinting and matching run on your phone. Nothing is deleted until you choose it and confirm.',
    ],
    hero: SHOTS.dashboard,
    sections: [
      {
        h2: 'See where your storage went',
        paragraphs: [
          'Storage Insights shows how much space is used and free, and gives the phone a storage health score out of 100 based on free space, how much your scans found to reclaim, how recently you scanned and the size of DeDup’s own cache. The activity log records what DeDup has scanned and cleaned.',
          'The storage map draws your internal storage as blocks sized by how much each folder holds. Tap a block to drill into it. Space that Android does not let apps inspect, such as other apps’ private data, is shown as one “System & Restricted Data” block rather than guessed at.',
        ],
        shot: SHOTS.insights,
      },
      {
        h2: 'Find the files that waste the most space',
        subsections: [
          {
            h3: 'Duplicate and similar photos',
            text: 'Exact copies and photos that look nearly the same, such as burst shots and re-saved images, are grouped together with a suggested photo to keep.',
          },
          {
            h3: 'Duplicate videos',
            text: 'Videos with identical sizes, or whose sampled frames match, are grouped so you can play each one before choosing.',
          },
          {
            h3: 'Duplicate PDFs, documents, APKs and archives',
            text: 'File Cleanup finds repeated documents and leftover APK install files, and the large file finder lists anything over 50, 100 or 200 MB.',
          },
          {
            h3: 'WhatsApp media and empty folders',
            text: 'The WhatsApp cleaner finds identical copies of WhatsApp images, videos and documents. Separate tools remove empty folders and clear DeDup’s own cache.',
          },
          {
            h3: 'Screenshots, memes, receipts and blurry photos',
            text: 'Smart AI Cleanup uses Google ML Kit image labelling on the phone to sort recent photos into groups such as screenshots, memes and receipts, and flags blurry or badly exposed shots.',
          },
        ],
        shot: SHOTS.fileCleanup,
      },
      {
        h2: 'What “AI” means in DeDup',
        paragraphs: [
          'DeDup uses on-device models for specific jobs: an image labeller sorts screenshots, memes and receipts; a face detector and a sharpness measure help suggest the best photo in a group of similar shots; and Talk to My Storage turns a request like “videos larger than 100 MB from last month” into size, type and date filters.',
          'Photo search matches your words against the album, app and date a photo came from, for example “WhatsApp March 2024”. It does not look at what is in the picture.',
        ],
        shot: SHOTS.optimize,
      },
      {
        h2: 'On-device processing and what leaves your phone',
        paragraphs: [
          'Scanning, hashing, duplicate detection, photo labelling and contact matching run on your phone. Your photos, videos, files and contacts are not uploaded.',
          'The app does use Firebase for sign-in, crash reports and usage analytics, as listed in the privacy policy. Deleting files and merging contacts require signing in with Google; you can scan and look at results as a guest.',
        ],
      },
      {
        h2: 'Review before anything is removed',
        bullets: [
          'Scans only list what they find. Nothing is selected for deletion until you select it.',
          'Photo and video deletions are copied to DeDup’s Trash first, then Android asks you to confirm. Items in Trash can be restored until they expire (30 days by default).',
          'Other cleaners, such as the WhatsApp cleaner, ask you to confirm and then delete permanently.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is DeDup free?',
        a: 'DeDup is free to download from Google Play and shows no ads.',
      },
      {
        q: 'Does DeDup upload my photos or files?',
        a: 'No. Scanning and matching run on your phone and your files are not uploaded. The app sends crash reports and usage analytics through Firebase, and your name and email if you sign in, as described in the privacy policy.',
      },
      {
        q: 'Do I need an account?',
        a: 'You can scan and view results as a guest. Deleting files and merging contacts require signing in with Google.',
      },
      {
        q: 'Can DeDup see other apps’ private data?',
        a: 'No. Android keeps each app’s private storage closed to other apps. DeDup shows that space as one “System & Restricted Data” block on the storage map, and its cache cleaner clears only DeDup’s own cache, not other apps’.',
      },
    ],
    guides: [
      { href: '/blog/android-1-5-3-storage-insights-and-health-score', label: 'How the storage health score works' },
      { href: '/blog/android-1-5-3-big-file-map', label: 'Reading the storage map' },
      { href: '/blog/what-dedup-sends-and-what-stays-on-your-phone', label: 'What DeDup sends and what stays on your phone' },
    ],
    teaser: 'See what is using your storage and clear duplicates, large files, cache and empty folders.',
  },

  '/duplicate-photo-cleaner': {
    path: '/duplicate-photo-cleaner',
    label: 'Duplicate Photo Cleaner',
    title: 'Duplicate Photo Cleaner & Similar Photo Finder | DeDup',
    description:
      'Find exact duplicate and near-duplicate photos on Android, including burst shots and resized copies. Adjust how strict matching is, keep the best shot and review every group before deleting.',
    eyebrow: 'Duplicate photo finder',
    h1: 'Find and remove duplicate and similar photos on Android',
    intro: [
      'Phones collect copies quietly: the same photo saved from three chats, a burst of ten nearly identical shots, an edited version next to the original. DeDup’s Image Scanner groups exact duplicates and look-alike photos so you can keep the one you want and remove the rest.',
      'Every group is shown to you first. The scan itself deletes nothing.',
    ],
    hero: SHOTS.dashboard,
    sections: [
      {
        h2: 'How DeDup finds exact duplicate photos',
        paragraphs: [
          'For each photo, DeDup combines the file size with a checksum of the start of the file. Two photos with the same size and checksum are treated as copies of each other, which catches the same picture saved twice or downloaded again under a different name.',
        ],
      },
      {
        h2: 'How it finds near-duplicate and similar photos',
        paragraphs: [
          'DeDup also builds a small visual fingerprint for every photo. It shrinks the image to a tiny grayscale grid and records how brightness changes across it, giving a 64-bit value. Photos whose fingerprints differ by only a few bits look alike and are grouped together, even if the files are not identical.',
        ],
        subsections: [
          {
            h3: 'Resized and recompressed copies',
            text: 'Because the fingerprint is taken from a heavily shrunk copy, a photo that was resized or re-saved at a different quality, as messaging apps do, usually lands close to the original and is grouped with it.',
          },
          {
            h3: 'Burst shots',
            text: 'Groups whose photos were taken within 3 seconds of each other get a BURST badge, and you can filter to bursts only.',
          },
          {
            h3: 'Slightly edited copies',
            text: 'Light edits such as a small brightness change often stay within the matching range. Heavier edits, large crops or filters change the fingerprint and may not be grouped.',
          },
          {
            h3: 'Rotated copies',
            text: 'DeDup reads each photo upright using its rotation tag, so a copy that differs only in that tag is compared correctly. A copy whose pixels were actually rotated produces a different fingerprint and is not grouped with the original.',
          },
        ],
      },
      {
        h2: 'Adjust how similar photos need to be',
        paragraphs: [
          'Settings has an Image Similarity slider from 0 to 20 bits, set to 10 by default. Lower values only group photos that are almost identical. Higher values also catch looser matches, with more chance of grouping photos you consider different.',
        ],
        shot: SHOTS.threshold,
      },
      {
        h2: 'Keep your preferred photo',
        paragraphs: [
          'In each group DeDup suggests one photo to keep and shows it first, labelled BEST SHOT for bursts or ML BEST CHOICE otherwise. The suggestion favours photos you marked as favourites, then sharper photos, better exposure, and open eyes and smiles detected on the phone.',
          'The label is only a suggestion. You choose which photos to select, and you can leave the suggested one and delete another instead.',
        ],
      },
      {
        h2: 'Review photos before deleting',
        bullets: [
          'Tap photos to select them; nothing is selected for you. Long-press a photo for a full-screen preview.',
          'Auto Clear keeps the first photo in every group and removes the rest, after a warning that similarity matching can make mistakes.',
          'Selected photos are copied to DeDup’s Trash, then Android shows its own delete confirmation. You can restore them from Trash until they expire (30 days by default).',
          'Deleting requires signing in with Google. Guests can scan and browse results.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does DeDup find duplicate photos with different file names?',
        a: 'Yes. Matching uses the file size, a checksum and a visual fingerprint, not the file name, so renamed copies are found.',
      },
      {
        q: 'Will DeDup delete photos automatically?',
        a: 'No. Scans only list groups. Photos are removed only after you select them, or choose Auto Clear, and confirm the Android delete prompt.',
      },
      {
        q: 'Can I get a deleted photo back?',
        a: 'Photos deleted from the Image Scanner are copied to DeDup’s Trash first, so you can restore them until they expire. The default is 30 days and can be changed in Settings.',
      },
      {
        q: 'Does it find rotated copies of a photo?',
        a: 'Only when the copy differs by its rotation tag. A copy whose pixels were rotated has a different fingerprint and is not grouped.',
      },
    ],
    guides: [
      { href: '/blog/android-1-5-3-scan-for-duplicate-photos', label: 'Step by step: scanning for duplicate photos' },
      { href: '/blog/android-1-5-3-burst-photos-and-best-shot', label: 'How burst groups and the best shot are chosen' },
      { href: '/blog/android-1-5-3-similarity-threshold', label: 'Choosing a similarity setting' },
    ],
    teaser: 'Group exact copies, burst shots and look-alike photos, then keep the best one.',
  },

  '/duplicate-video-cleaner': {
    path: '/duplicate-video-cleaner',
    label: 'Duplicate Video Cleaner',
    title: 'Duplicate Video Finder & Cleaner for Android | DeDup',
    description:
      'Find duplicate and near-identical videos on Android by comparing file size and sampled frames. Play each video before you delete it and free up storage.',
    eyebrow: 'Duplicate video finder',
    h1: 'Find duplicate videos on Android and free up storage',
    intro: [
      'Videos are usually the largest files on a phone, so one extra copy can cost as much space as hundreds of photos. Copies pile up when the same clip is downloaded twice, shared back to you in a chat, or exported again after editing.',
      'DeDup’s Video Scanner groups duplicate and near-identical videos so you can watch them and decide which to keep.',
    ],
    hero: SHOTS.iphoneVideo,
    sections: [
      {
        h2: 'How DeDup detects duplicate videos',
        subsections: [
          {
            h3: 'Identical files',
            text: 'Videos with exactly the same size in bytes are grouped together. This catches straight copies, such as the same file in two folders.',
          },
          {
            h3: 'Near-identical videos',
            text: 'DeDup takes three frames from each video, at 10%, 50% and 90% of its length, and fingerprints each one. Two videos are grouped when at least two of the three frames match closely. This can catch the same clip saved at a different quality or file size.',
          },
          {
            h3: 'What is not matched',
            text: 'A trimmed clip, or a video with footage added at the start, puts different scenes at those three points, so it is usually not grouped with the original.',
          },
        ],
        paragraphs: [
          'All of this runs on the phone. Fingerprints are saved locally, so a later scan can resume and skip videos it has already processed.',
        ],
      },
      {
        h2: 'Review videos before deletion',
        bullets: [
          'Each video shows a thumbnail, its length, size and file name, with a Play button so you can check it before choosing.',
          'The first video in each group is labelled KEEP. DeDup does not rank videos by quality, so check which copy you want.',
          'Sort groups by largest, smallest or most copies to start where you will save the most.',
          'Selected videos are copied to DeDup’s Trash, then Android asks you to confirm the delete. You can restore them from Trash until they expire (30 days by default).',
        ],
        shot: SHOTS.dashboard,
      },
      {
        h2: 'Why duplicate videos use so much storage',
        paragraphs: [
          'A minute of phone video can take many times the space of a photo, and the size grows with resolution and frame rate. A single duplicate of a long recording can free more space than clearing an entire folder of screenshots, which is why it is worth checking videos first when storage is tight.',
          'Messaging apps add to this: a video you send is often saved again in the app’s own folder, so the same clip can exist in your camera folder and in a chat folder.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which video formats does DeDup scan?',
        a: 'Videos listed in Android’s media library with common video extensions, including mp4, mkv, mov, avi and webm.',
      },
      {
        q: 'Does DeDup pick the best-quality copy?',
        a: 'No. The first video in each group is labelled KEEP, but there is no quality ranking for videos. Play each copy and keep the one you prefer.',
      },
      {
        q: 'Is the video comparison done online?',
        a: 'No. Frames are read and fingerprinted on your phone. Videos are not uploaded.',
      },
    ],
    guides: [
      { href: '/blog/android-1-5-3-scan-for-duplicate-videos', label: 'How the video scan works, step by step' },
      { href: '/blog/android-1-5-3-play-a-video-from-the-scanner', label: 'Playing a video from the scanner' },
    ],
    teaser: 'Group identical and near-identical videos and play each one before you delete.',
  },

  '/whatsapp-cleaner': {
    path: '/whatsapp-cleaner',
    label: 'WhatsApp Cleaner',
    title: 'WhatsApp Cleaner for Android: Clean WhatsApp Media | DeDup',
    description:
      'Find duplicate WhatsApp images, videos and documents, sent copies you also received, and large WhatsApp files on Android. Review and confirm before anything is deleted.',
    eyebrow: 'WhatsApp storage cleaner',
    h1: 'Clean WhatsApp media and storage on Android',
    intro: [
      'Group chats fill phones with forwarded photos, videos and documents, and the same file often arrives more than once. DeDup’s WhatsApp cleaner scans the media WhatsApp has saved on your phone and lists the copies and large files that are safe candidates for removal.',
      'You choose what to delete, and DeDup asks you to confirm first.',
    ],
    hero: SHOTS.optimize,
    sections: [
      {
        h2: 'What the WhatsApp cleaner scans',
        bullets: [
          'WhatsApp Images, WhatsApp Video and WhatsApp Documents, including the Sent folders inside each.',
          'Both the older WhatsApp folder and the newer location under Android/media used on recent Android versions.',
          'Files are found through Android’s media library, using the photo and media access DeDup already has.',
        ],
      },
      {
        h2: 'What it finds',
        subsections: [
          {
            h3: 'Duplicate media',
            text: 'Images and videos that are byte-for-byte identical, for example the same photo forwarded to you in two groups. DeDup confirms this with a SHA-256 checksum, so files that only look alike are not matched here.',
          },
          {
            h3: 'Sent copies you also received',
            text: 'A file in a Sent folder that is identical to one you received. The sent copy is listed as redundant only when the received copy exists, so you are not shown a file that may be your only copy.',
          },
          {
            h3: 'Large files',
            text: 'WhatsApp files of 10 MB or more, largest first, which are usually long videos or big documents.',
          },
        ],
      },
      {
        h2: 'Review, then clean up',
        bullets: [
          'Results show a potential savings figure and the files in each section with their size.',
          'Delete one file, or a whole section with Delete All. Either way DeDup shows a confirmation with the number of files first.',
          'WhatsApp deletions are permanent: they do not go to DeDup’s Trash, so check the list before confirming.',
          'Deleting requires signing in with Google. Guests can scan and view results.',
        ],
      },
      {
        h2: 'Android limitations to know about',
        bullets: [
          'Statuses are not scanned. WhatsApp keeps them in a hidden folder that Android’s media library does not index, and reaching it would need broad all-files access.',
          'Voice notes and other audio are not part of the WhatsApp scan.',
          'Deleting a file from your phone does not remove the message from the chat. The chat keeps the message, but the media will no longer be on this phone.',
          'Chat backups in Google Drive are managed by WhatsApp and are not touched.',
          'Only files Android’s media library lists can be found. A file WhatsApp has not yet made visible to it will not appear.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does DeDup clean WhatsApp statuses?',
        a: 'No. Statuses live in a hidden WhatsApp folder that Android’s media library does not index, so DeDup does not scan them.',
      },
      {
        q: 'Will deleting media remove my WhatsApp messages?',
        a: 'No. The messages stay in your chats. Only the media file on this phone is removed.',
      },
      {
        q: 'Can I undo a WhatsApp cleanup?',
        a: 'No. WhatsApp cleanups are permanent, which is why DeDup asks you to confirm each one. Review the list before you delete.',
      },
      {
        q: 'Does DeDup read my WhatsApp chats?',
        a: 'No. It only looks at the media files WhatsApp saved in its Media folders. It does not open or read chats.',
      },
    ],
    guides: [
      { href: '/blog/android-1-5-3-whatsapp-cleaner', label: 'WhatsApp cleaner: what it scans and how it deletes' },
      { href: '/blog/android-1-5-3-social-media-cleaner', label: 'Cleaning media from other social apps' },
    ],
    teaser: 'Find duplicate WhatsApp media, sent copies you also received and large WhatsApp files.',
  },
}
