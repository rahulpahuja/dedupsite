import Image from 'next/image'

/**
 * DeDup lock-up: black app icon (/logo.svg) + wordmark. The black icon is the
 * logo at every size. Gap = 1/4 icon width, wordmark cap height = 1/2 icon
 * height. Wordmark is Space Grotesk Bold, -2% tracking.
 */
export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-display text-[22px] font-bold leading-none tracking-[-0.02em] text-white ${className}`}
    >
      <Image src="/logo.svg" alt="" width={32} height={32} unoptimized className="h-8 w-8" />
      DeDup
    </span>
  )
}
