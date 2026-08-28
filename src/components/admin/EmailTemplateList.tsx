'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Send, Loader2, Plus } from 'lucide-react'
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
import { updateEmailTemplatesOrder, duplicateEmailTemplate } from '@/app/actions/email-templates'
import { fmtDateTime } from '@/lib/adminFormat'

// Valores gravados na coluna `category` do banco — o casamento é feito contra
// eles, sem tradução. Só o rótulo exibido passa pelo catálogo, via `labelKey`.
// Toda categoria gravada no banco precisa estar aqui: a lista renderiza por
// categoria conhecida, e um valor de fora some da tela em silêncio. Foi o que
// aconteceu com 'Proposta' e 'Campanha', que existiam no banco e o Will não via
// (e não podia editar, que é a razão de os templates estarem no banco).
const CATEGORIES = [
  'Anfrage',
  'Proposta',
  'Reserva',
  'Pós-Tour',
  'Campanha',
  'Membros',
  'Sistema',
] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_LABEL_KEYS: Record<Category, string> = {
  'Anfrage': 'anfrage',
  'Proposta': 'proposta',
  'Campanha': 'campanha',
  'Reserva': 'reserva',
  'Pós-Tour': 'posTour',
  'Membros': 'membros',
  'Sistema': 'sistema',
}

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  'Anfrage':   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  'Proposta':  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200'},
  'Campanha':  { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'  },
  'Reserva':   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  'Pós-Tour':  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  'Membros':   { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
  'Sistema':   { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200'  },
}

/** Rótulo curto do locale nos chips/badges: 'pt-BR' → 'PT', 'de' → 'DE'. */
function localeShort(locale: string): string {
  return locale.split('-')[0].toUpperCase()
}

function SortableTemplateCard({
  template,
  missingLocales,
}: {
  template: EmailTemplate
  missingLocales: string[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: template.id,
  })
  const router = useRouter()
  const t = useTranslations('admin.emailTemplates')
  const tCommon = useTranslations('admin.common')
  const [sending, setSending] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const handleTestSend = async () => {
    setSending(true)
    setToast(null)
    try {
      const res = await fetch('/api/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: template.slug, locale: template.locale }),
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

  const handleDuplicate = async (toLocale: string) => {
    setDuplicating(toLocale)
    setToast(null)
    try {
      const result = await duplicateEmailTemplate(template.slug, template.locale, toLocale)
      if (result.success) {
        setToast(t('varianteCriada', { locale: localeShort(toLocale) }))
        setTimeout(() => setToast(null), 3000)
        router.refresh()
      } else {
        alert(tCommon('erroPrefixo', { mensagem: result.error ?? '' }))
      }
    } catch (err: any) {
      alert(tCommon('erroPrefixo', { mensagem: err.message }))
    } finally {
      setDuplicating(null)
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
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
            {localeShort(template.locale)} ✓
          </span>
          {missingLocales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleDuplicate(locale)}
              disabled={duplicating !== null}
              title={t('criarVariante', { locale: localeShort(locale) })}
              className="text-xs bg-white text-gray-400 border border-dashed border-gray-300 px-1.5 py-0.5 rounded font-semibold shrink-0 hover:text-green-700 hover:border-green-400 transition-colors disabled:opacity-50 inline-flex items-center gap-0.5"
            >
              {duplicating === locale ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              {localeShort(locale)}
            </button>
          ))}
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
          href={`/admin/email-templates/${template.slug}?locale=${template.locale}`}
          className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {tCommon('editar')}
        </Link>
      </div>
    </div>
  )
}

export default function EmailTemplateList({
  initialTemplates,
  supportedLocales,
}: {
  initialTemplates: EmailTemplate[]
  supportedLocales: string[]
}) {
  const t = useTranslations('admin.emailTemplates')
  const tCategorias = useTranslations('admin.emailTemplates.categorias')
  const [templates, setTemplates] = useState(initialTemplates)
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [saving, setSaving] = useState(false)

  // router.refresh() após duplicar variante manda a lista nova via props; sem
  // isto o estado local (necessário pro drag-and-drop otimista) ficaria velho.
  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Cobertura por slug — alimenta os badges de variante em falta de cada card.
  const localesBySlug = new Map<string, Set<string>>()
  for (const tpl of templates) {
    if (!localesBySlug.has(tpl.slug)) localesBySlug.set(tpl.slug, new Set())
    localesBySlug.get(tpl.slug)!.add(tpl.locale)
  }
  const missingLocalesFor = (slug: string) =>
    supportedLocales.filter((locale) => !localesBySlug.get(slug)?.has(locale))

  const visibleTemplates =
    localeFilter === 'all' ? templates : templates.filter((tpl) => tpl.locale === localeFilter)

  const templatesByCategory = (category: string) =>
    visibleTemplates
      .filter((tpl) => tpl.category === category)
      .sort((a, b) => a.sort_order - b.sort_order || a.locale.localeCompare(b.locale))

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
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          {t('idioma')}
          <select
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">{t('todosIdiomas')}</option>
            {supportedLocales.map((locale) => (
              <option key={locale} value={locale}>
                {localeShort(locale)}
              </option>
            ))}
          </select>
        </label>
        {saving && (
          <p className="text-xs text-gray-400 text-right">{t('salvandoOrdem')}</p>
        )}
      </div>

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
                    <SortableTemplateCard
                      key={template.id}
                      template={template}
                      missingLocales={missingLocalesFor(template.slug)}
                    />
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
