'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Send, Loader2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EmailTemplate } from '@/types/email-templates'
import { updateEmailTemplatesOrder } from '@/app/actions/email-templates'
import { fmtDateTime } from '@/lib/adminFormat'

// Valores gravados na coluna `category` do banco — o casamento é feito contra
// eles, sem tradução. Só o rótulo exibido passa pelo catálogo, via `labelKey`.
const CATEGORIES = ['Reserva', 'Pós-Tour', 'Membros', 'Sistema'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_LABEL_KEYS: Record<Category, string> = {
  'Reserva': 'reserva',
  'Pós-Tour': 'posTour',
  'Membros': 'membros',
  'Sistema': 'sistema',
}

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  'Reserva':   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'Pós-Tour':  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  'Membros':   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
  'Sistema':   { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200'  },
}

function SortableTemplateCard({ template }: { template: EmailTemplate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: template.id,
  })
  const t = useTranslations('admin.emailTemplates')
  const tCommon = useTranslations('admin.common')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleTestSend = async () => {
    setSending(true)
    setToast(null)
    try {
      const res = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug }),
      })
      const data = await res.json()
      if (data.success) {
        setToast(t('testeEnviado'))
        setTimeout(() => setToast(null), 3000)
      } else {
        alert(tCommon('erroPrefixo', { mensagem: data.error }))
      }
    } catch (err: any) {
      alert(tCommon('erroPrefixo', { mensagem: err.message }))
    } finally {
      setSending(false)
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-green-300 transition-colors"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors shrink-0 select-none"
        title={t('arrastarReordenar')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5"/>
          <circle cx="11" cy="4" r="1.5"/>
          <circle cx="5" cy="8" r="1.5"/>
          <circle cx="11" cy="8" r="1.5"/>
          <circle cx="5" cy="12" r="1.5"/>
          <circle cx="11" cy="12" r="1.5"/>
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">{template.name}</span>
          <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono shrink-0">
            {template.slug}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          <span className="font-medium text-gray-600">{t('assuntoPrefixo')}</span> {template.subject}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {t('editadoPrefixo')}{fmtDateTime(template.updated_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="relative flex flex-col items-center">
          <button
            onClick={handleTestSend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {tCommon('enviando')}
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {t('enviarTeste')}
              </>
            )}
          </button>
          {toast && (
            <span className="absolute top-full mt-1.5 whitespace-nowrap text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded shadow-sm z-10">
              {toast}
            </span>
          )}
        </div>
        <Link
          href={`/admin/email-templates/${template.slug}`}
          className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {tCommon('editar')}
        </Link>
      </div>
    </div>
  )
}

export default function EmailTemplateList({ initialTemplates }: { initialTemplates: EmailTemplate[] }) {
  const t = useTranslations('admin.emailTemplates')
  const tCategorias = useTranslations('admin.emailTemplates.categorias')
  const [templates, setTemplates] = useState(initialTemplates)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const templatesByCategory = (category: string) =>
    templates
      .filter((tpl) => tpl.category === category)
      .sort((a, b) => a.sort_order - b.sort_order)

  const handleDragEnd = async (event: DragEndEvent, category: string) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const categoryTemplates = templatesByCategory(category)
    const oldIndex = categoryTemplates.findIndex((tpl) => tpl.id === active.id)
    const newIndex = categoryTemplates.findIndex((tpl) => tpl.id === over.id)
    const reordered = arrayMove(categoryTemplates, oldIndex, newIndex)

    const updatedTemplates = templates.map((tpl) => {
      const newPos = reordered.findIndex((r) => r.id === tpl.id)
      if (newPos !== -1) return { ...tpl, sort_order: newPos + 1 }
      return tpl
    })
    setTemplates(updatedTemplates)

    setSaving(true)
    await updateEmailTemplatesOrder(
      reordered.map((tpl, i) => ({ id: tpl.id, sort_order: i + 1 }))
    )
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      {saving && (
        <p className="text-xs text-gray-400 text-right">{t('salvandoOrdem')}</p>
      )}

      {CATEGORIES.map((category) => {
        const items = templatesByCategory(category)
        if (items.length === 0) return null
        const colors = CATEGORY_COLORS[category]
        const labelKey = CATEGORY_LABEL_KEYS[category]

        return (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                {tCategorias.has(labelKey) ? tCategorias(labelKey) : category}
              </span>
              <span className="text-xs text-gray-400">{t('templatesCount', { count: items.length })}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Sortable list for this category */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, category)}
            >
              <SortableContext
                items={items.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((template) => (
                    <SortableTemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )
      })}
    </div>
  )
}
