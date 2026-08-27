'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  ArrowLeft,
  Loader2,
  Ship,
  CalendarDays,
  Users,
  Instagram,
  ShieldCheck,
} from 'lucide-react';
import {
  Field,
  FormShell,
  HighlightBox,
  LinkRow,
  MeanwhileSection,
  NextSteps,
  OptionTile,
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
import { CAMPAIGNS, type PhoneCountry } from '@/lib/campaigns';

const CAMPAIGN = CAMPAIGNS['aida-karneval-2028'];

/** 'sambodromo' -> 'interestSambodromo' (chave no catálogo alemão). */
function interestKey(id: string): string {
  return `interest${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

export default function AidaAnfrageForm({
  whatsappHref,
  instagramHref,
  instagramHandle,
}: {
  whatsappHref: string;
  instagramHref: string;
  instagramHandle: string;
}) {
  const t = useTranslations('public.anfrageAida');
  const searchParams = useSearchParams();
  // Cru para a rota, que é quem valida — mesma regra do formulário principal
  // (src/app/anfrage/AnfrageForm.tsx). Filtrar aqui já custou o canal 'site',
  // que existia na rota e era rebaixado para 'other' antes de chegar lá.
  const von = searchParams.get('von');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('DE');
  const [pax, setPax] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState('');
  const [preferredDay, setPreferredDay] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (id: string) =>
    setInterests(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const clearFieldError = (field: string) =>
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Erro no campo, não num aviso no topo: quem envia pelo celular está no fim
    // da página e nunca veria uma mensagem lá em cima.
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t('errorName');
    if (!email.trim()) errors.email = t('errorEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = t('errorEmailInvalid');
    if (!consent) errors.consent = t('errorConsent');

    setFieldErrors(errors);
    const firstInvalid = ([
      ['name', nameRef],
      ['email', emailRef],
      ['consent', consentRef],
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
          campaign: CAMPAIGN.slug,
          name,
          email,
          phone: toInternationalPhone(phoneCountry, phone),
          phoneCountry,
          pax,
          children,
          childrenAges: children > 0 ? childrenAges : '',
          preferredDay,
          interests,
          consent,
          source: von,
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
          <RecapRow icon={<CalendarDays className="w-4 h-4" />}>{t('datesValue')}</RecapRow>
          <RecapRow icon={<Users className="w-4 h-4" />}>{people}</RecapRow>
        </RecapBox>

        {/* Expectativa explícita: a espera aqui é de meses, não de dias */}
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

          <LinkRow
            href="/ist-rio-gefaehrlich"
            icon={<ShieldCheck className={`${SHIELD_ICON_CLS} text-emerald-600`} />}
          >
            {t('successLinkSafety')}
          </LinkRow>
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
      {/* Cabeçalho centralizado; as datas vêm antes do texto porque são o
          que qualifica o visitante ("é o meu navio, é a minha data"). */}
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Ship className="w-3.5 h-3.5" />
          {t('badge')}
        </span>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight text-balance">
          {t('title')}
        </h1>
      </header>

      {/* Datas fixas: vêm da escala do navio, o cliente não escolhe */}
      <HighlightBox
        icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
        label={t('datesLabel')}
        value={t('datesValue')}
        hint={t('datesHint')}
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

          {children > 0 && (
            <Field label={t('childrenAgesLabel')} hint={t('childrenAgesHint')}>
              <input
                type="text"
                value={childrenAges}
                onChange={e => setChildrenAges(e.target.value)}
                className={inputCls()}
                placeholder={t('childrenAgesPlaceholder')}
                maxLength={100}
              />
            </Field>
          )}
        </Section>

        <Section title={t('preferredDayLabel')} hint={t('preferredDayHint')}>
          <fieldset className="space-y-2.5">
            <legend className="sr-only">{t('preferredDayLabel')}</legend>
            {[
              { value: '', label: t('preferredDayAny') },
              { value: CAMPAIGN.fixedDays[0], label: t('preferredDay0') },
              { value: CAMPAIGN.fixedDays[1], label: t('preferredDay1') },
            ].map(option => (
              <OptionTile
                key={option.value || 'any'}
                type="radio"
                name="preferredDay"
                checked={preferredDay === option.value}
                onChange={() => setPreferredDay(option.value)}
              >
                {option.label}
              </OptionTile>
            ))}
          </fieldset>
        </Section>

        <Section title={t('interestsLabel')} hint={t('interestsHint')}>
          <fieldset className="space-y-2.5">
            <legend className="sr-only">{t('interestsLabel')}</legend>
            {CAMPAIGN.interests.map(id => (
              <OptionTile
                key={id}
                type="checkbox"
                checked={interests.includes(id)}
                onChange={() => toggleInterest(id)}
              >
                {t(interestKey(id))}
              </OptionTile>
            ))}
          </fieldset>
        </Section>

        <div className="pt-7 border-t border-gray-100 space-y-5">
          <div>
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                fieldErrors.consent ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <input
                ref={consentRef}
                type="checkbox"
                checked={consent}
                onChange={e => { setConsent(e.target.checked); clearFieldError('consent'); }}
                className="mt-0.5 h-5 w-5 shrink-0 rounded text-green-600 border-gray-300 focus:ring-green-500 focus:ring-offset-0"
              />
              <span className="text-[13px] text-gray-600 leading-relaxed">
                {t('consentLabel')} <span className="text-red-500">*</span>
              </span>
            </label>
            {fieldErrors.consent && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {fieldErrors.consent}
              </p>
            )}
          </div>

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
