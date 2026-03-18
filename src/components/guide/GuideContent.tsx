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

  // Se o conteúdo for string, tenta fazer o parse caso seja um JSON stringificado
  let parsedContent = content;
  
  if (typeof content === 'string') {
    try {
      // Se começar com { (indicando JSON), tenta parsear
      if (content.trim().startsWith('{')) {
        parsedContent = JSON.parse(content);
      }
    } catch (e) {
      console.error('Error parsing content as JSON:', e);
      // Mantém como string se falhar o parse
    }
  }

  // Se for objeto TipTap, gera HTML. Se for string simples (legado), exibe como texto.
  let html = ''
  
  if (typeof parsedContent === 'string') {
    // Fallback básico para conteúdo legado (Markdown simples ou texto puro)
    // Para capítulos antigos que ainda não foram editados no TipTap
    html = `<p style="white-space: pre-wrap;">${parsedContent}</p>`
  } else {
    try {
      html = generateHTML(parsedContent, [
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
      return <p className="text-red-500">Erro ao renderizar conteúdo.</p>
    }
  }

  return (
    <div
      className="guide-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
