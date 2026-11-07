import { serializeJsonLd } from '@/lib/site'

/** Renders one or more JSON-LD objects as a structured-data script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd, so `</script>` inside the data cannot break out.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
