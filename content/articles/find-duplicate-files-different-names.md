---
title: How to Find Duplicate Files with Different Names
excerpt: Renamed copies like report(1).pdf or IMG_2024_copy.jpg escape name-based searches. Here is how size and content checks find duplicates regardless of their names.
tags: Duplicate files, Android, Storage
topic: guide-duplicate-files-names
---
Searching your phone for files with the same name only finds some duplicates. Copies often get new names: `invoice.pdf` becomes `invoice(1).pdf`, a photo saved from a chat gets a timestamp name, and an APK downloaded twice gets a number added. To find these, you have to compare the files, not their names.

## Why names are unreliable

- Browsers and download managers add `(1)`, `(2)` to avoid overwriting.
- Messaging apps rename everything they save, usually with a date-based name.
- File managers add "copy" when you duplicate a file.
- Two different files can also share a name, such as `scan.pdf` in two folders, so matching names doesn't prove they are duplicates.

## How content-based duplicate detection works

1. **Compare sizes.** Files with different sizes can't be identical, so this quickly rules out most pairs.
2. **Compare contents with a checksum.** For files of the same size, a checksum such as SHA-256 is calculated from the contents. If two checksums match, the files are identical, whatever they are called.

Similar photos and videos need a different approach, a visual fingerprint, because their files differ even when the picture is the same. DeDup's [duplicate photo cleaner](/duplicate-photo-cleaner) and [duplicate video cleaner](/duplicate-video-cleaner) explain this.

## Finding duplicate files on Android with DeDup

DeDup's File Cleanup scans for duplicate PDFs, documents, archives and APK files, and its large file finder lists files over 50, 100 or 200 MB. Files are grouped by size and name, or by their contents on a deep scan, so renamed copies are found on a deep scan. The WhatsApp cleaner uses checksums to find identical WhatsApp files across chats.

All of this runs on your phone. The [AI storage cleaner page](/ai-storage-cleaner) gives an overview of every scanner.

## Before deleting a duplicate file

- **Check where each copy is.** Keep the one in the folder you actually use, and remove copies in Downloads or chat folders.
- **Open it if unsure.** Two documents with similar names and sizes may still differ.
- **APK files** are installers. Once an app is installed, the APK is usually safe to remove.

[Download DeDup on Google Play](https://play.google.com/store/apps/details?id=com.rp.dedup&utm_source=website&utm_medium=organic&utm_campaign=dedup_seo&utm_content=blog_find_duplicate_files_different_names) to find duplicate files on your Android phone.
