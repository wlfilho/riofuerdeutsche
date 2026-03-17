'use client'

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

interface GuideContentProps {
  content: any // JSON do TipTap
}

export default function GuideContent({ content }: GuideContentProps) {
  if (!content) return null

  // Se o conteúdo for string (legado), tenta exibir como parágrafo ou retorna nulo
  // Se for objeto TipTap, gera HTML
  let html = ''
  
  if (typeof content === 'string') {
    // Fallback básico para conteúdo legado se necessário durante a transição
    html = `<p>${content}</p>`
  } else {
    try {
      html = generateHTML(content, [
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
      ])
    } catch (e) {
      console.error('Error generating HTML from TipTap JSON:', e)
      return null
    }
  }

  return (
    <div
      className="guide-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
