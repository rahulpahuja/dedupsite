import { PLATFORM_LABEL, appVersionLabel, isPlatform, osVersionLabel, type PostMeta } from '@/lib/blog-meta'

/** Platform / DeDup version / OS version chips for a post. Renders nothing for a general post. */
export function PostMetaBadges({ post, size = 'sm' }: { post: PostMeta; size?: 'sm' | 'md' }) {
  const items = [
    isPlatform(post.platform) ? PLATFORM_LABEL[post.platform] : null,
    appVersionLabel(null, post.appVersion),
    osVersionLabel(post.platform, post.osVersion),
  ].filter((v): v is string => !!v)
  if (items.length === 0) return null
  const pad = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Applies to">
      {items.map((label) => (
        <li
          key={label}
          className={`rounded-full border border-white/15 bg-white/[0.06] font-medium text-white/80 ${pad}`}
        >
          {label}
        </li>
      ))}
    </ul>
  )
}
