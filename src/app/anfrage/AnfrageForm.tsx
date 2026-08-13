'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  Instagram,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  Field,
  FormShell,
  HighlightBox,
  LinkRow,
  MeanwhileSection,
  NextSteps,
  PhoneField,
  RecapBox,
  RecapRow,
  ROW_ICON_CLS,
  Section,
  SHIELD_ICON_CLS,
  Stepper,
  WhatsAppCta,
  inputCls,
  toInternationalPhone,
} from '@/components/anfrage/FormUi';
import { type PhoneCountry } from '@/lib/campaigns';

function formatGermanDay(iso: string, locale: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AnfrageForm({
  whatsappHref,
  instagramHref,
  instagramHandle,
}: {
  whatsappHref: string;
  instagramHref: string;
  instagramHandle: string;
}) {
  const t = useTranslations('public.anfrage');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const von = searchParams.get('von');
  const source = von === 'whatsapp' || von === 'email' || von === 'instagram' ? von : 'other';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('DE');
  const [pax, setPax] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState<string[]>([]);
  const [dayInput, setDayInput] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev));

  const addDay = () => {
    if (!dayInput) return;
    setDays(prev => (prev.includes(dayInput) ? prev : [...prev, dayInput].sort()));
    setDayInput('');
    clearFieldError('days');
  };

  const removeDay = (d: string) => setDays(prev => prev.filter(x => x !== d));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Erro no campo, não num aviso no topo: quem envia pelo celular está no fim
    // da página e nunca veria uma mensagem lá em cima.
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t('errorName');
    if (!email.trim()) errors.email = t('errorEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = t('errorEmailInvalid');
    if (days.length === 0) errors.days = t('errorDays');

    setFieldErrors(errors);
    const firstInvalid = ([
      ['name', nameRef],
      ['email', emailRef],
      ['days', dayRef],
    ] as const).find(([field]) => errors[field]);
    if (firstInvalid) {
      const el = firstInvalid[1].current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: toInternationalPhone(phoneCountry, phone),
          phoneCountry,
          pax,
          children,
          days,
          source,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t('errorGeneric'));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t('errorNetwork'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const people = [
      t('successRecapAdults', { count: pax }),
      ...(children > 0 ? [t('successRecapChildren', { count: children })] : []),
    ].join(' + ');

    return (
      <FormShell>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
          <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
            {t('successTitle', { name: name.trim().split(' ')[0] })}
          </h2>
          <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">{t('successText')}</p>
        </div>

        <RecapBox title={t('successRecapTitle')}>
          <RecapRow icon={<CalendarDays className="w-4 h-4" />}>
            {/* Um dia por linha: a data alemã por extenso já ocupa a largura
                toda no celular, e uma lista corrida viraria um bloco só. */}
            <span className="flex flex-col gap-0.5">
              {days.map(d => (
                <span key={d}>{formatGermanDay(d, locale)}</span>
              ))}
            </span>
          </RecapRow>
          <RecapRow icon={<Users className="w-4 h-4" />}>{people}</RecapRow>
        </RecapBox>

        <NextSteps
          title={t('successStepsTitle')}
          steps={[t('successStep1'), t('successStep2'), t('successStep3')]}
        />

        {whatsappHref && (
          <WhatsAppCta
            href={whatsappHref}
            question={t('successWhatsappQuestion')}
            action={t('successWhatsappAction')}
          />
        )}

        <MeanwhileSection title={t('successMeanwhileTitle')}>
          <LinkRow
            href="/touren"
            icon={<Compass className={`${ROW_ICON_CLS} text-blue-600`} />}
          >
            {t('successLinkTouren')}
          </LinkRow>

          <LinkRow
            href="/ist-rio-gefaehrlich"
            icon={<ShieldCheck className={`${SHIELD_ICON_CLS} text-emerald-600`} />}
          >
            {t('successLinkSafety')}
          </LinkRow>

          {instagramHref && (
            <LinkRow
              href={instagramHref}
              external
              icon={<Instagram className={`${ROW_ICON_CLS} text-[#ee2a7b]`} />}
            >
              {t('successLinkInstagram')}
              {instagramHandle && <span className="text-gray-400"> @{instagramHandle}</span>}
            </LinkRow>
          )}
        </MeanwhileSection>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell>
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          {t('badge')}
        </span>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight text-balance">
          {t('title')}
        </h1>
      </header>

      {/* O que a pessoa recebe em troca do formulário — antes do texto, porque é
          o que responde ao "por que eu preencheria isso?". */}
      <HighlightBox
        icon={<Compass className="w-5 h-5 text-blue-600" />}
        label={t('promiseLabel')}
        value={t('promiseValue')}
        hint={t('promiseHint')}
      />

      <div className="mt-6 space-y-3 text-[15px] text-gray-600 leading-relaxed">
        <p>{t('intro1')}</p>
        <p>{t('intro2')}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        <Section title={t('sectionContact')}>
          <Field label={t('nameLabel')} required error={fieldErrors.name}>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); clearFieldError('name'); }}
              className={inputCls(!!fieldErrors.name)}
              placeholder={t('namePlaceholder')}
              autoComplete="name"
            />
          </Field>

          <Field label={t('emailLabel')} required error={fieldErrors.email}>
            <input
              ref={emailRef}
              type="email"
              inputMode="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
              className={inputCls(!!fieldErrors.email)}
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
            />
          </Field>

          <PhoneField
            phone={phone}
            country={phoneCountry}
            onChange={next => { setPhone(next.phone); setPhoneCountry(next.country); }}
            labels={{
              label: t('phoneLabel'),
              hint: t('phoneHint'),
              hintOther: t('phoneOtherHint'),
              countryLabel: t('phoneCountryLabel'),
              countryOther: t('phoneCountryOther'),
              placeholder: t('phonePlaceholder'),
              placeholderOther: t('phoneOtherPlaceholder'),
              trunkStripped: t('phoneTrunkStripped'),
            }}
          />
        </Section>

        <Section title={t('sectionGroup')}>
          {/* Abaixo de 380px os dois botões do stepper espremem o número a
              ~20px — nessa faixa cada contador ocupa a linha inteira. */}
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:gap-4">
            <Stepper
              label={t('adultsLabel')}
              value={pax}
              min={1}
              onChange={setPax}
              decLabel={t('decrement')}
              incLabel={t('increment')}
            />
            <Stepper
              label={t('childrenLabel')}
              value={children}
              min={0}
              onChange={setChildren}
              decLabel={t('decrement')}
              incLabel={t('increment')}
            />
          </div>
        </Section>

        <Section title={t('daysLabel')} hint={t('daysHint')}>
          <div>
            <div className="flex items-stretch gap-2">
              <input
                ref={dayRef}
                type="date"
                min={todayIso()}
                value={dayInput}
                onChange={e => setDayInput(e.target.value)}
                // Enter no seletor de data adiciona o dia em vez de enviar o
                // formulário incompleto.
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); addDay(); }
                }}
                aria-label={t('dayInputLabel')}
                className={`${inputCls(!!fieldErrors.days)} flex-1 min-w-0`}
              />
              <button
                type="button"
                onClick={addDay}
                disabled={!dayInput}
                className="shrink-0 h-12 px-4 sm:px-5 flex items-center gap-1.5 text-[15px] font-semibold bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-green-50 hover:border-green-300 hover:text-green-700 active:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden min-[380px]:inline">{t('addDay')}</span>
              </button>
            </div>

            {fieldErrors.days && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.days}
              </p>
            )}

            {/* Os dias escolhidos viram linhas com a mesma altura de toque das
                opções — no celular um chip pequeno com "✕" é difícil de acertar. */}
            {days.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {days.map(d => (
                  <li
                    key={d}
                    className="flex items-center gap-3 min-h-[52px] pl-4 pr-2 py-2 rounded-xl border border-green-600 bg-green-50/70"
                  >
                    <CalendarDays className="w-4 h-4 shrink-0 text-green-700" />
                    <span className="flex-1 text-[15px] leading-snug text-gray-800">
                      {formatGermanDay(d, locale)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDay(d)}
                      aria-label={`${t('removeDay')}: ${formatGermanDay(d, locale)}`}
                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-green-700/70 hover:text-red-600 hover:bg-white/70 active:bg-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        <div className="pt-7 border-t border-gray-100 space-y-5">
          {/* Erro de rede/servidor: fica junto do botão, onde o olho está */}
          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200"
            >
              {error}
            </div>
          )}

          {/* Honeypot — hidden from humans, filled by bots */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-14 px-6 bg-green-600 text-white text-base font-semibold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? t('submitting') : t('submit')}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">{t('privacyNote')}</p>
        </div>
      </form>
    </FormShell>
  );
}
