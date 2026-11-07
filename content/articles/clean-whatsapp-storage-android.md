---
title: How to Clean WhatsApp Storage on Android
excerpt: WhatsApp media can take a large share of your phone storage. Here is how to see what WhatsApp is storing, remove duplicate and large files, and what Android limits.
tags: WhatsApp, Android, Storage
topic: guide-whatsapp-storage
---
WhatsApp saves every photo, video, voice note and document you send or receive, and busy group chats can add a lot in a short time. Cleaning it up takes two steps: finding out what WhatsApp is storing, then removing what you don't need.

## Step 1: See how much WhatsApp is using

In WhatsApp, open **Settings → Storage and data → Manage storage**. It lists chats by the space their media uses, and highlights files larger than 5 MB and frequently forwarded files. You can delete media per chat from there.

Android's own **Settings → Storage** shows WhatsApp's total, including its app data.

## Step 2: Remove duplicates and large files

The same file often arrives more than once, for example a photo forwarded to two groups or a document sent to you twice. WhatsApp's tool shows these per chat, but it does not compare files across chats.

DeDup's [WhatsApp cleaner](/whatsapp-cleaner) scans WhatsApp's Images, Video and Documents folders together and lists:

- **Duplicate media.** Images and videos that are byte-for-byte identical, confirmed with a checksum.
- **Sent copies you also received.** A file in a Sent folder that is identical to one you received. DeDup only lists the sent copy when the received one exists.
- **Large files.** WhatsApp files of 10 MB or more, largest first.

You choose what to delete, and DeDup asks you to confirm. These deletions are permanent, so check the list first.

## What Android does not let you clean easily

- **Statuses** are kept in a hidden folder that Android's media library does not index. DeDup does not scan them. They expire on their own after 24 hours.
- **Voice notes** are not part of DeDup's WhatsApp scan. Use WhatsApp's Manage storage to clear them per chat.
- **Chat history and backups.** Deleting a media file does not delete the message, and backups in Google Drive are managed by WhatsApp.

## Stop WhatsApp filling up again

- In **Settings → Storage and data → Media auto-download**, turn off automatic downloads on mobile data, or for videos and documents altogether.
- In a busy group, turn off **Media visibility** so its media does not appear in your gallery.
- Use disappearing messages in chats where you never need the media later.

[Download DeDup on Google Play](https://play.google.com/store/apps/details?id=com.rp.dedup&utm_source=website&utm_medium=organic&utm_campaign=dedup_seo&utm_content=blog_clean_whatsapp_storage_android) to find duplicate and large WhatsApp files.
