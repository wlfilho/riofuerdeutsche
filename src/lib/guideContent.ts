/**
 * Server-side utility for converting TipTap JSON content to HTML.
 * Lives in lib/ so it can be used in Server Components without 'use client'.
 */
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

const EXTENSIONS = [
  StarterKit,
  Image,
  Youtube,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Underline,
  Link,
  Highlight,
  TextStyle,
  Color,
]

/**
 * Converts a TipTap JSON content (object or JSON string) to an HTML string.
 * Falls back to wrapping plain text in a <p> if content is a plain string.
 */
export function contentToHtml(content: string | object | null | undefined): string {
  if (!content) return ''

  let parsed: string | object = content

  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (trimmed.startsWith('{')) {
      try {
        parsed = JSON.parse(trimmed)
      } catch {
        // Keep as plain string
      }
    }
  }

  if (typeof parsed === 'string') {
    // Legacy plain text — wrap preserving line breaks
    return `<p style="white-space: pre-wrap;">${parsed}</p>`
  }

  try {
    return generateHTML(parsed as any, EXTENSIONS)
  } catch {
    return '<p style="color: red;">Fehler beim Laden des Inhalts.</p>'
  }
}
