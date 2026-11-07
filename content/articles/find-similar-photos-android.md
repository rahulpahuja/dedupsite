---
title: How to Find Similar Photos on Your Android Phone
excerpt: Similar photos are not exact copies, so ordinary duplicate checks miss them. Here is how similar-photo detection works and how to review matches before deleting.
tags: Similar photos, Android, Duplicate photos
topic: guide-similar-photos
---
Most phones hold far more *similar* photos than true duplicates: five attempts at the same group shot, a burst of a moving pet, a screenshot taken twice. These are different files, so a simple "same file" check will not find them. You need a tool that compares what the photos look like.

## What counts as a similar photo

- **Burst and repeated shots** taken seconds apart.
- **Resized copies**, such as the smaller version a messaging app saves.
- **Re-compressed copies** that have the same picture at a different file size.
- **Lightly edited versions**, for example with a small brightness change.

Photos of the same place taken at different times, or with people in different positions, are usually *not* close enough to match. That is intentional: they are different pictures.

## How similar-photo detection works

Apps that find similar photos do not compare every pixel. They create a small **fingerprint** of each image. DeDup, for example, shrinks each photo to a tiny grayscale grid and records how brightness changes from one square to the next. That gives a 64-bit value. Two photos whose values differ in only a few bits look alike.

Because the fingerprint comes from a heavily shrunk image, it ignores differences in resolution and compression, which is why resized and re-saved copies match. It does notice a different composition, so different scenes stay apart.

There are limits. A photo whose pixels were rotated, heavily cropped or filtered produces a different fingerprint and usually will not match its original.

## Choosing how strict matching should be

DeDup has an Image Similarity setting from 0 to 20 bits, set to 10 by default:

- **Lower values** only group photos that are nearly identical. Fewer matches, fewer surprises.
- **Higher values** also group looser matches. More matches, but check each group carefully.

If a scan groups photos you consider different, lower the setting and scan again. If it misses obvious burst shots, raise it slightly.

## Reviewing similar photos before deleting

Similar is not the same as identical, so review every group:

1. Open each group and compare the photos side by side. Long-press for a full-screen view.
2. Keep the sharpest one with everyone's eyes open. DeDup suggests a photo to keep, using sharpness, exposure, detected faces and your favourites, but you decide.
3. Select only the photos you want to remove, then confirm. Photos removed from the Image Scanner go to DeDup's Trash first, so you can restore them for a while.

The [duplicate photo cleaner page](/duplicate-photo-cleaner) covers exact and near-duplicate detection in more detail.

[Download DeDup on Google Play](https://play.google.com/store/apps/details?id=com.rp.dedup&utm_source=website&utm_medium=organic&utm_campaign=dedup_seo&utm_content=blog_find_similar_photos_android) to find similar photos on your phone.
