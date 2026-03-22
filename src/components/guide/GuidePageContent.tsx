import type { ToCItem } from './GuideToC'

/**
 * Parses the HTML string and extracts h2/h3 headings to build a ToC item list.
 * Also injects `id` attributes into the headings for anchor links.
 * Runs server-side (no DOM APIs needed — pure string manipulation).
 */
export function extractToCItems(html: string): ToCItem[] {
  const items: ToCItem[] = []
  const usedIds = new Set<string>()

  const headingRegex = /<(h[1-4])([^>]*)?>([\s\S]*?)<\/h[1-4]\s*>/gi
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const level = parseInt(tag.charAt(1))

    // match[1] is tag, match[2] is attributes, match[3] is inner content
    const text = (match[3] || '').replace(/<[^>]+>/g, '').trim()
    if (!text) continue

    // Build slug from text
    let id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    // Ensure uniqueness
    let finalId = id
    let counter = 1
    while (usedIds.has(finalId)) {
      finalId = `${id}-${counter++}`
    }
    usedIds.add(finalId)

    items.push({ id: finalId, text, level })
  }

  return items
}

/**
 * Injects `id` attributes into h2/h3 tags in the HTML string.
 * Must be called with the same order as extractToCItems to match IDs.
 */
export function injectHeadingIds(html: string, items: ToCItem[]): string {
  let index = 0
  return html.replace(/<(h[1-4])([^>]*)?>([\s\S]*?)<\/h[1-4]\s*>/gi, (match, tag, attrs, inner) => {
    const item = items[index]
    if (!item) return match
    index++
    // Remove any existing id attribute then inject ours (handle undefined attrs)
    const cleanAttrs = (attrs || '').replace(/\s*id="[^"]*"/gi, '')
    return `<${tag}${cleanAttrs} id="${item.id}">${inner}</${tag}>`
  })
}

interface GuidePageContentProps {
  html: string
}

export default function GuidePageContent({ html }: GuidePageContentProps) {
  return (
    <div
      className="guide-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
