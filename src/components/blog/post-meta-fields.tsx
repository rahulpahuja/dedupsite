'use client'

export type PostMetaValue = { platform: string; appVersion: string; osVersion: string; topic: string }

export const EMPTY_POST_META: PostMetaValue = { platform: '', appVersion: '', osVersion: '', topic: '' }

const input =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/80 placeholder-white/20 outline-none transition focus:border-sky/40'
const label = 'mb-1.5 block text-xs font-medium text-white/50'

/** Admin inputs for what a post documents: platform, DeDup version, OS version, topic. */
export function PostMetaFields({ value, onChange }: { value: PostMetaValue; onChange: (v: PostMetaValue) => void }) {
  const set = (k: keyof PostMetaValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value })
  return (
    <>
      <div>
        <label className={label} htmlFor="meta-platform">Platform</label>
        <select id="meta-platform" value={value.platform} onChange={set('platform')} className={`${input} bg-night-2`}>
          <option value="">General (any platform)</option>
          <option value="android">Android</option>
          <option value="ios">iPhone (iOS)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="meta-app">DeDup version</label>
          <input id="meta-app" value={value.appVersion} onChange={set('appVersion')} placeholder="1.5.3" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="meta-os">OS version</label>
          <input id="meta-os" value={value.osVersion} onChange={set('osVersion')} placeholder="15" className={input} disabled={!value.platform} />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="meta-topic">Topic (groups the same action across versions)</label>
        <input id="meta-topic" value={value.topic} onChange={set('topic')} placeholder="move-to-trash" className={input} />
      </div>
    </>
  )
}
