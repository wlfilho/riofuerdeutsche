'use client'

import { useEditor, EditorContent } from '@tiptap/react'
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
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import CharacterCount from '@tiptap/extension-character-count'
import { useTranslations } from 'next-intl'

interface RichEditorProps {
  content: any
  onChange: (json: any) => void
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const t = useTranslations('admin.editor')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ controls: true, nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: t('placeholder') }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      CharacterCount,
    ],
    content: content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  // Função para adicionar imagem por URL
  const addImage = () => {
    const url = window.prompt(t('urlImagem'))
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  // Função para adicionar vídeo do YouTube
  const addYoutube = () => {
    const url = window.prompt(t('urlYoutube'))
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  // Função para adicionar link
  const setLink = () => {
    const url = window.prompt(t('url'))
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  return (
    <div className="rich-editor-wrapper">

      {/* TOOLBAR */}
      <div className="rich-editor-toolbar">

        {/* Headings */}
        <div className="toolbar-group">
          <select
            onChange={(e) => {
              const val = e.target.value
              if (val === 'p') editor.chain().focus().setParagraph().run()
              else editor.chain().focus().toggleHeading({ level: Number(val) as 1|2|3 }).run()
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' : 'p'
            }
          >
            <option value="p">{t('paragrafo')}</option>
            <option value="1">{t('titulo1')}</option>
            <option value="2">{t('titulo2')}</option>
            <option value="3">{t('titulo3')}</option>
          </select>
        </div>

        <div className="toolbar-divider" />

        {/* Formatação básica */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''} title={t('negrito')}>
            <strong>B</strong>
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''} title={t('italico')}>
            <em>I</em>
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''} title={t('sublinhado')}>
            <u>U</u>
          </button>
          <button onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'active' : ''} title={t('marcar')}>
            🖊
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Alinhamento */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''} title={t('esquerda')}>
            ◀
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''} title={t('centro')}>
            ▬
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''} title={t('direita')}>
            ▶
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Listas */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''} title={t('lista')}>
            {t('listaAbrev')}
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''} title={t('listaNumerada')}>
            {t('listaNumeradaAbrev')}
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Blocos especiais */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'active' : ''} title={t('citacao')}>
            {t('citacaoAbrev')}
          </button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title={t('linhaDivisoria')}>
            {t('linhaAbrev')}
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Tabela */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title={t('inserirTabela')}>
            {t('tabelaAbrev')}
          </button>
          {editor.isActive('table') && (
            <>
              <button onClick={() => editor.chain().focus().addColumnAfter().run()}>{t('adicionarColuna')}</button>
              <button onClick={() => editor.chain().focus().addRowAfter().run()}>{t('adicionarLinha')}</button>
              <button onClick={() => editor.chain().focus().deleteTable().run()}>{t('removerTabela')}</button>
            </>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Mídia */}
        <div className="toolbar-group">
          <button onClick={addImage} title={t('inserirImagem')}>{t('imagemAbrev')}</button>
          <button onClick={addYoutube} title={t('inserirYoutube')}>{t('youtubeAbrev')}</button>
          <button onClick={setLink}
            className={editor.isActive('link') ? 'active' : ''} title={t('link')}>
            {t('linkAbrev')}
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Undo/Redo */}
        <div className="toolbar-group">
          <button onClick={() => editor.chain().focus().undo().run()} title={t('desfazer')}>↩</button>
          <button onClick={() => editor.chain().focus().redo().run()} title={t('refazer')}>↪</button>
        </div>

        {/* Contador de caracteres */}
        <div className="toolbar-char-count">
          {editor.storage.characterCount.characters()}{t('caracteres')}
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO */}
      <EditorContent editor={editor} className="rich-editor-content" />

    </div>
  )
}
