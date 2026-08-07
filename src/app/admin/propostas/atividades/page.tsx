'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type {
  ProposalService,
  ProposalServiceCategory,
  ProposalServicePeriod,
  ProposalTransportType,
} from '@/lib/proposals';
import GroupsSection, { type GroupServiceOption } from './GroupsSection';

// ─── Types ────────────────────────────────────────────────────────────────────

type CostDraft = {
  _id: string;
  description: string;
  base_price: number | '';
  currency: 'EUR' | 'BRL';
  price_type: 'fixed' | 'per_pax' | 'per_hour';
  // true = cobrado na proposta; false = cliente paga no local (valor exibido).
  include_in_price: boolean;
};

// Texto traduzível de um serviço, por idioma. É o que vai para
// proposal_service_translations — as colunas antigas de proposal_services
// (name/description/pdf_note) estão deprecated e não são mais escritas.
type LocaleText = {
  name: string;
  description: string;
  pdf_note: string;
};

const EMPTY_LOCALE_TEXT: LocaleText = { name: '', description: '', pdf_note: '' };

// Serviço como vem da API: além das colunas, o mapa locale → texto.
type ServiceWithTranslations = ProposalService & {
  translations?: Record<string, Partial<LocaleText> | undefined>;
};

// Campos NÃO traduzíveis. O texto por idioma vive em `texts`, à parte.
type FormState = {
  category: ProposalServiceCategory | '';
  notes: string;
  is_active: boolean;
  duration_hours: string;
  transfer_hours_to: string;
  transfer_hours_back: string;
  suggested_period: ProposalServicePeriod | '';
  transport_type_id: string;
};

const EMPTY_FORM: FormState = {
  category: '', notes: '',
  is_active: true, duration_hours: '', transfer_hours_to: '',
  transfer_hours_back: '', suggested_period: '', transport_type_id: '',
};

// Rótulo curto da aba/badge: 'pt-BR' → 'PT'.
function localeLabel(locale: string): string {
  return locale.split('-')[0].toUpperCase();
}

// Nome exibido: primeiro idioma com tradução; fallback na coluna deprecated.
function getDisplayName(service: ServiceWithTranslations, locales: string[]): string {
  return locales.map(l => service.translations?.[l]?.name?.trim()).find(Boolean) ?? service.name;
}

// Busca insensível a acentos e caixa ("atracao" acha "Atração").
function normalizeSearch(s: string): string {
  return s.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Só a aparência: os rótulos vêm de admin.atividades.categorias / .periodos.
const CATEGORY_CLS: Record<ProposalServiceCategory, string> = {
  transfer: 'bg-blue-100 text-blue-700',
  tour:     'bg-green-100 text-green-700',
  extra:    'bg-purple-100 text-purple-700',
  atração:  'bg-amber-100 text-amber-700',
};

const PERIOD_ICON: Record<ProposalServicePeriod, string> = {
  morning:   '🌅',
  afternoon: '🌇',
  evening:   '🌙',
  full_day:  '☀️',
};

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

// Decimal hours ↔ "HH:MM" for <input type="time">
function hoursToTime(h: number | null | undefined): string {
  if (h == null || isNaN(h)) return '';
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function timeToHours(s: string): number | null {
  if (!s) return null;
  const [hh, mm] = s.split(':').map(Number);
  const total = (hh || 0) + (mm || 0) / 60;
  return total > 0 ? Math.round(total * 1000) / 1000 : null;
}

function formatHours(h: number): string {
  const totalMin = Math.round(h * 60);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  if (hh === 0) return `${mm}min`;
  if (mm === 0) return `${hh}h`;
  return `${hh}h ${mm}min`;
}

// ─── CategoryBadge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ProposalServiceCategory }) {
  const tCat = useTranslations('admin.atividades.categorias');
  const cls = CATEGORY_CLS[category] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {tCat.has(category) ? tCat(category) : category}
    </span>
  );
}

// ─── CoverageBadges ───────────────────────────────────────────────────────────

// "DE ✓ PT —": um locale conta como traduzido quando existe linha com name
// não-vazio em proposal_service_translations.
function CoverageBadges({
  locales,
  translations,
}: {
  locales: string[];
  translations: Record<string, Partial<LocaleText> | undefined> | undefined;
}) {
  const t = useTranslations('admin.atividades');
  return (
    <div className="flex items-center gap-1.5">
      {locales.map(locale => {
        const done = Boolean(translations?.[locale]?.name?.trim());
        return (
          <span
            key={locale}
            title={done ? t('idiomaTraduzido', { idioma: locale }) : t('idiomaFaltando', { idioma: locale })}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-semibold rounded ${
              done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {localeLabel(locale)} {done ? '✓' : '—'}
          </span>
        );
      })}
    </div>
  );
}

// ─── CostRow (inside modal) ───────────────────────────────────────────────────

function CostRow({
  cost,
  onChange,
  onRemove,
}: {
  cost: CostDraft;
  onChange: (updates: Partial<CostDraft>) => void;
  onRemove: () => void;
}) {
  const t = useTranslations('admin.atividades');
  const tPropostas = useTranslations('admin.propostas');
  return (
    <div className="grid grid-cols-[1fr_6rem_5rem_9rem_auto_2rem] gap-2 items-center">
      <input
        type="text"
        value={cost.description}
        onChange={e => onChange({ description: e.target.value })}
        placeholder={t('guiaPlaceholder')}
        className={INPUT_CLS}
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={cost.base_price}
        onChange={e => onChange({ base_price: parseFloat(e.target.value) || '' })}
        placeholder="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <select
        value={cost.currency}
        onChange={e => onChange({ currency: e.target.value as CostDraft['currency'] })}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="EUR">EUR</option>
        <option value="BRL">BRL</option>
      </select>
      <select
        value={cost.price_type}
        onChange={e => onChange({ price_type: e.target.value as CostDraft['price_type'] })}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="fixed">{t('tiposPreco.fixed')}</option>
        <option value="per_pax">{t('tiposPreco.per_pax')}</option>
        <option value="per_hour">{t('tiposPreco.per_hour')}</option>
      </select>
      <label
        className="flex items-center gap-1 cursor-pointer select-none"
        title={tPropostas('marcadoEntraPreco')}
      >
        <input
          type="checkbox"
          checked={cost.include_in_price}
          onChange={e => onChange({ include_in_price: e.target.checked })}
          className="rounded"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">{t('cobrar')}</span>
      </label>
      <button
        onClick={onRemove}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// ─── ActivityModal ────────────────────────────────────────────────────────────

function ActivityModal({
  service,
  transportTypes,
  locales,
  onClose,
  onSaved,
}: {
  service: ServiceWithTranslations | null; // null = create mode
  transportTypes: ProposalTransportType[];
  locales: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations('admin.atividades');
  const tCommon = useTranslations('admin.common');
  const [form, setForm] = useState<FormState>(() => {
    if (!service) return EMPTY_FORM;
    return {
      category: service.category,
      notes: service.notes ?? '',
      is_active: service.is_active,
      duration_hours: hoursToTime(service.duration_hours),
      transfer_hours_to: hoursToTime(service.transfer_hours_to),
      transfer_hours_back: hoursToTime(service.transfer_hours_back),
      suggested_period: service.suggested_period ?? '',
      transport_type_id: service.transport_type_id ?? '',
    };
  });

  // Um rascunho por idioma suportado; a aba só troca qual deles está à vista.
  const [texts, setTexts] = useState<Record<string, LocaleText>>(() => {
    const out: Record<string, LocaleText> = {};
    for (const locale of locales) {
      const tr = service?.translations?.[locale];
      out[locale] = {
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        pdf_note: tr?.pdf_note ?? '',
      };
    }
    return out;
  });

  const [activeLocale, setActiveLocale] = useState(() => locales[0] ?? 'de');
  const activeText = texts[activeLocale] ?? EMPTY_LOCALE_TEXT;

  const setText = (field: keyof LocaleText) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTexts(prev => ({
        ...prev,
        [activeLocale]: { ...(prev[activeLocale] ?? EMPTY_LOCALE_TEXT), [field]: e.target.value },
      }));

  const [costs, setCosts] = useState<CostDraft[]>(() =>
    (service?.costs ?? []).map(c => ({
      _id: c.id,
      description: c.description,
      base_price: c.base_price,
      currency: c.currency as CostDraft['currency'],
      price_type: c.price_type as CostDraft['price_type'],
      include_in_price: c.include_in_price ?? true,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // Gera a descrição curta via IA a partir do título da aba ativa, no idioma
  // da aba. Só substitui o campo do idioma ativo — os outros ficam intactos.
  const handleGenerateDescription = async () => {
    const title = activeText.name.trim();
    if (!title || generatingDesc) return;
    setGeneratingDesc(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ai/activity-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: form.category || null, locale: activeLocale }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t('erroGerarDescricao')); return; }
      setTexts(prev => ({
        ...prev,
        [activeLocale]: { ...(prev[activeLocale] ?? EMPTY_LOCALE_TEXT), description: data.description },
      }));
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setGeneratingDesc(false);
    }
  };

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const selectedTransport = transportTypes.find(t => t.id === form.transport_type_id) ?? null;

  const transportHint = useMemo(() => {
    if (!selectedTransport) return null;
    if (selectedTransport.is_included) return t('custoNaoAdicional');
    if (selectedTransport.is_manual) return t('valorAjustadoManual');
    if (selectedTransport.tiers.length > 0) return t('custoCalculadoAuto');
    return t('semCustoTransporte');
  }, [selectedTransport, t]);

  const totalHours = useMemo(() => {
    const to = timeToHours(form.transfer_hours_to) ?? 0;
    const dur = timeToHours(form.duration_hours) ?? 0;
    const back = timeToHours(form.transfer_hours_back) ?? 0;
    return to + dur + back;
  }, [form.transfer_hours_to, form.duration_hours, form.transfer_hours_back]);

  const addCost = () =>
    setCosts(prev => [
      ...prev,
      { _id: Math.random().toString(36).slice(2), description: '', base_price: '', currency: 'EUR', price_type: 'fixed', include_in_price: true },
    ]);

  const updateCost = (id: string, updates: Partial<CostDraft>) =>
    setCosts(prev => prev.map(c => (c._id === id ? { ...c, ...updates } : c)));

  const removeCost = (id: string) =>
    setCosts(prev => prev.filter(c => c._id !== id));

  const handleSave = async () => {
    setError(null);

    // Pelo menos um idioma precisa de título — o resto o guia preenche depois.
    // Nada é traduzido automaticamente: idioma em branco fica em branco.
    const primaryLocale = locales[0];
    if (!texts[primaryLocale]?.name.trim()) {
      setError(t('tituloObrigatorioIdioma', { idioma: localeLabel(primaryLocale) }));
      return;
    }
    if (!form.category) { setError(t('categoriaObrigatoria')); return; }

    setSaving(true);
    try {
      const translations: Record<string, LocaleText> = {};
      for (const locale of locales) {
        const txt = texts[locale] ?? EMPTY_LOCALE_TEXT;
        translations[locale] = {
          name: txt.name.trim(),
          description: txt.description.trim(),
          pdf_note: txt.pdf_note.trim(),
        };
      }

      const payload = {
        translations,
        category: form.category,
        notes: form.notes.trim() || null,
        is_active: form.is_active,
        duration_hours: timeToHours(form.duration_hours),
        transfer_hours_to: timeToHours(form.transfer_hours_to),
        transfer_hours_back: timeToHours(form.transfer_hours_back),
        suggested_period: form.suggested_period || null,
        transport_type_id: form.transport_type_id || null,
        costs: costs.map(c => ({
          description: c.description,
          base_price: Number(c.base_price) || 0,
          currency: c.currency,
          price_type: c.price_type,
          include_in_price: c.include_in_price,
        })),
      };

      const url = service
        ? `/api/admin/proposals/services/${service.id}`
        : '/api/admin/proposals/services';
      const method = service ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? tCommon('erroSalvar')); return; }

      onSaved();
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {service ? t('editarAtividade') : t('novaAtividadeTitulo')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Section 1: Informações Gerais */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              {t('informacoesGerais')}
            </h3>
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('categoria')} <span className="text-red-500">*</span>
                </label>
                <select value={form.category} onChange={set('category')} className={INPUT_CLS}>
                  <option value="">{t('selecionar')}</option>
                  <option value="tour">{t('categorias.tour')}</option>
                  <option value="transfer">{t('categorias.transfer')}</option>
                  <option value="atração">{t('categorias.atração')}</option>
                  <option value="extra">{t('categorias.extra')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tipoTransporte')}</label>
                <select value={form.transport_type_id} onChange={set('transport_type_id')} className={INPUT_CLS}>
                  <option value="">{t('nenhumNaoDefinido')}</option>
                  {transportTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {transportHint && (
                  <p className="mt-1 text-xs text-blue-600">{transportHint}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('observacaoInterna')}{' '}
                  <span className="text-xs font-normal text-gray-400">{t('naoApareceNoPdf')}</span>
                </label>
                <textarea value={form.notes} onChange={set('notes')} rows={2} className={`${INPUT_CLS} resize-none`} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">{tCommon('ativo')}</span>
              </label>
            </div>
          </div>

          {/* ── Section 2: Textos por idioma */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {t('textosPorIdioma')}
              </h3>
              {/* Abas de idioma: trocam qual rascunho está à vista. Cada idioma
                  é salvo separado — nada é traduzido automaticamente. */}
              <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                {locales.map(locale => {
                  const isActive = locale === activeLocale;
                  const filled = Boolean(texts[locale]?.name.trim());
                  return (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => setActiveLocale(locale)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {localeLabel(locale)}
                      <span className={filled ? 'text-green-600' : 'text-gray-300'}> {filled ? '✓' : '—'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tituloCampo')}{' '}
                  {activeLocale === locales[0] && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={activeText.name}
                  onChange={setText('name')}
                  className={INPUT_CLS}
                  placeholder={t('tituloPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('descricaoCurta')}</label>
                <div className="relative">
                  <textarea
                    value={activeText.description}
                    onChange={setText('description')}
                    rows={2}
                    className={`${INPUT_CLS} resize-none ${activeText.name.trim() ? 'pr-10' : ''}`}
                    placeholder={t('descricaoCurtaPlaceholder')}
                  />
                  {activeText.name.trim() && (
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDesc}
                      title={t('gerarDescricaoIa')}
                      className="absolute top-2 right-2 p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {generatingDesc ? (
                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm6 0a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0111 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notaFixaPdf')}</label>
                <textarea
                  value={activeText.pdf_note}
                  onChange={setText('pdf_note')}
                  rows={2}
                  className={`${INPUT_CLS} resize-none`}
                  placeholder={t('notaFixaPlaceholder')}
                />
              </div>

              <p className="text-xs text-gray-400">{t('idiomaVazioDica')}</p>
            </div>
          </div>

          {/* ── Section 3: Tempo */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{t('tempo')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('duracao')}</label>
                <input type="time" value={form.duration_hours} onChange={set('duration_hours')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ida')}</label>
                <input type="time" value={form.transfer_hours_to} onChange={set('transfer_hours_to')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('volta')}</label>
                <input type="time" value={form.transfer_hours_back} onChange={set('transfer_hours_back')} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('totalEstimado')}</label>
                <div className={`${INPUT_CLS} bg-gray-50 text-gray-700 font-semibold pointer-events-none`}>
                  {totalHours > 0 ? formatHours(totalHours) : tCommon('vazio')}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('periodoSugerido')}</label>
              <select value={form.suggested_period} onChange={set('suggested_period')} className={INPUT_CLS}>
                <option value="">{t('naoEspecificado')}</option>
                <option value="morning">{PERIOD_ICON.morning} {t('periodos.morning')}</option>
                <option value="afternoon">{PERIOD_ICON.afternoon} {t('periodos.afternoon')}</option>
                <option value="evening">{PERIOD_ICON.evening} {t('periodos.evening')}</option>
                <option value="full_day">{PERIOD_ICON.full_day} {t('periodos.full_day')}</option>
              </select>
            </div>
          </div>

          {/* ── Section 3: Itens de Custo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t('itensCusto')}</h3>
              <button
                onClick={addCost}
                className="text-xs font-semibold text-green-600 hover:text-green-800 transition-colors"
              >
                {t('adicionarCusto')}
              </button>
            </div>

            {costs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                {t('semCustosAdicionais')}
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_6rem_5rem_9rem_2rem] gap-2 mb-1">
                  <span className="text-xs text-gray-400">{t('descricao')}</span>
                  <span className="text-xs text-gray-400">{tCommon('valor')}</span>
                  <span className="text-xs text-gray-400">{t('moeda')}</span>
                  <span className="text-xs text-gray-400">{t('tipo')}</span>
                  <span />
                </div>
                {costs.map(cost => (
                  <CostRow
                    key={cost._id}
                    cost={cost}
                    onChange={u => updateCost(cost._id, u)}
                    onRemove={() => removeCost(cost._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            {tCommon('cancelar')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? tCommon('salvando') : tCommon('salvar')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({
  service,
  locales,
  onCancel,
  onConfirm,
  loading,
}: {
  service: ServiceWithTranslations;
  locales: string[];
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const t = useTranslations('admin.atividades');
  const tCommon = useTranslations('admin.common');
  // Excluir o serviço leva junto as traduções (FK ON DELETE CASCADE).
  const displayName = getDisplayName(service, locales);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('atividadeExcluir')}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {t.rich('temCerteza', {
            nome: displayName,
            strong: chunks => <strong>{chunks}</strong>,
          })}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            {tCommon('cancelar')}
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? t('excluindo') : tCommon('excluir')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AtividadesPage() {
  const t = useTranslations('admin.atividades');
  const tCommon = useTranslations('admin.common');
  const tPropostas = useTranslations('admin.propostas');
  const [services, setServices] = useState<ServiceWithTranslations[]>([]);
  const [transportTypes, setTransportTypes] = useState<ProposalTransportType[]>([]);
  // Idiomas vêm de site_settings.supported_locales, nunca hardcoded aqui.
  const [locales, setLocales] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceWithTranslations | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Barra de filtros: busca por nome (qualquer idioma), categoria e direção
  // alfabética. Só afeta a exibição — `services` continua como veio da API.
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProposalServiceCategory | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const visibleServices = useMemo(() => {
    const query = normalizeSearch(search.trim());
    const filtered = services.filter(s => {
      if (categoryFilter && s.category !== categoryFilter) return false;
      if (!query) return true;
      // Procura no nome exibido e em todas as traduções, pra achar a
      // atividade mesmo buscando no idioma que não é o primeiro.
      const haystacks = [
        getDisplayName(s, locales),
        ...locales.map(l => s.translations?.[l]?.name ?? ''),
      ];
      return haystacks.some(h => normalizeSearch(h).includes(query));
    });
    return [...filtered].sort((a, b) => {
      const cmp = getDisplayName(a, locales).localeCompare(
        getDisplayName(b, locales), 'pt-BR', { sensitivity: 'base' }
      );
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [services, locales, search, categoryFilter, sortDir]);

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== '';

  // Catálogo enxuto para o gerenciador de grupos: nome de exibição já
  // resolvido e duração total somada — o componente não conhece traduções.
  const groupServiceOptions = useMemo<GroupServiceOption[]>(
    () =>
      services.map(s => ({
        id: s.id,
        name: getDisplayName(s, locales),
        category: s.category,
        totalHours: (s.transfer_hours_to ?? 0) + (s.duration_hours ?? 0) + (s.transfer_hours_back ?? 0),
        isActive: s.is_active,
      })),
    [services, locales],
  );

  // null → create; ServiceWithTranslations → edit
  const [modalService, setModalService] = useState<ServiceWithTranslations | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        fetch('/api/admin/proposals/services'),
        fetch('/api/admin/proposals/transports'),
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();
      if (!sRes.ok) { setError(sData.error ?? t('erroCarregar')); return; }
      setServices(sData.services ?? []);
      setLocales(sData.supportedLocales ?? []);
      if (tRes.ok) setTransportTypes(tData.transports ?? []);
    } catch {
      setError(tCommon('erroRede'));
    } finally {
      setLoading(false);
    }
  }, [t, tCommon]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => { setModalService(null); setModalOpen(true); };
  const openEdit = (s: ServiceWithTranslations) => { setModalService(s); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSaved = () => { closeModal(); fetchServices(); };

  const handleToggle = async (service: ServiceWithTranslations) => {
    const newValue = !service.is_active;
    // Optimistic update
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newValue } : s));

    const res = await fetch(`/api/admin/proposals/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newValue }),
    });
    if (!res.ok) {
      // Revert
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !newValue } : s));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/proposals/services/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? tCommon('erroDeletar')); return; }
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert(tCommon('erroRede'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link href="/admin/propostas" className="hover:text-gray-700 transition-colors">{tPropostas('titulo')}</Link>
              <span>/</span>
              <span className="text-gray-600">{t('breadcrumb')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('novaAtividade')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
        )}

        {/* Filter / sort bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('buscarPlaceholder')}
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                title={t('limparBusca')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as ProposalServiceCategory | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{t('todasCategorias')}</option>
            <option value="tour">{t('categoriasPlural.tour')}</option>
            <option value="transfer">{t('categoriasPlural.transfer')}</option>
            <option value="atração">{t('categoriasPlural.atração')}</option>
            <option value="extra">{t('categoriasPlural.extra')}</option>
          </select>

          <button
            onClick={() => setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            title={t('ordemAlfabetica')}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {sortDir === 'asc' ? 'A–Z' : 'Z–A'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {!loading && hasActiveFilters && (
            <span className="text-xs text-gray-400">
              {t('resultadosFiltro', { count: visibleServices.length, total: services.length })}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('nome')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colIdiomas')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('categoria')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colTransporte')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colDuracaoTotal')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colPeriodo')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('colCustos')}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('ativo')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{tCommon('acoes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '60%' : '50%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <p className="text-gray-400 text-sm mb-3">{t('nenhumaAtividade')}</p>
                      <button
                        onClick={openCreate}
                        className="inline-block px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {t('criarPrimeira')}
                      </button>
                    </td>
                  </tr>
                ) : visibleServices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <p className="text-gray-400 text-sm mb-3">{t('nenhumResultado')}</p>
                      <button
                        onClick={() => { setSearch(''); setCategoryFilter(''); }}
                        className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
                      >
                        {t('limparFiltros')}
                      </button>
                    </td>
                  </tr>
                ) : (
                  visibleServices.map(s => {
                    const total = (s.transfer_hours_to ?? 0) + (s.duration_hours ?? 0) + (s.transfer_hours_back ?? 0);
                    const periodIcon = s.suggested_period ? PERIOD_ICON[s.suggested_period] : null;
                    const transportName = transportTypes.find(t => t.id === s.transport_type_id)?.name ?? null;
                    const displayName = getDisplayName(s, locales);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{displayName}</td>
                        <td className="px-4 py-3">
                          <CoverageBadges locales={locales} translations={s.translations} />
                        </td>
                        <td className="px-4 py-3">
                          <CategoryBadge category={s.category} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {transportName ?? <span className="text-gray-300">{tCommon('vazio')}</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">
                          {total > 0 ? formatHours(total) : tCommon('vazio')}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {periodIcon && s.suggested_period
                            ? `${periodIcon} ${t(`periodos.${s.suggested_period}`)}`
                            : tCommon('vazio')}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.costs.length === 0
                            ? <span className="text-gray-300 text-xs">{t('semCusto')}</span>
                            : <span className="text-xs">{t('custos', { count: s.costs.length })}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggle(s)}
                            className={`relative w-9 h-5 rounded-full transition-colors ${s.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(s)}
                              title={tCommon('editar')}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              title={tCommon('excluir')}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && <GroupsSection services={groupServiceOptions} />}
      </div>

      {modalOpen && locales.length > 0 && (
        <ActivityModal
          service={modalService}
          transportTypes={transportTypes}
          locales={locales}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          service={deleteTarget}
          locales={locales}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
