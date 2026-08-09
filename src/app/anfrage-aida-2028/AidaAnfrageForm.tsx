'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Ship,
  CalendarDays,
  Users,
  Minus,
  Plus,
  Instagram,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { CAMPAIGNS, PHONE_COUNTRIES, type PhoneCountry } from '@/lib/campaigns';

const CAMPAIGN = CAMPAIGNS['aida-karneval-2028'];

// text-base (16px) não é escolha estética: abaixo disso o Safari no iPhone dá
// zoom no campo ao focar e o layout sai do lugar. h-12 mantém o alvo de toque
// nos 48px recomendados.
const INPUT_CLS =
  'w-full h-12 px-4 bg-white border rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent';

const LINK_ROW_CLS =
  'flex items-center gap-3 min-h-[52px] px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors';

// No celular o rótulo dessas linhas quebra em duas; o ícone cresce junto para
// acompanhar a altura do texto em vez de flutuar pequeno ao lado dele.
const ROW_ICON_CLS = 'w-7 h-7 sm:w-5 sm:h-5 shrink-0';

// Compensação óptica: no viewBox de 24, o escudo do lucide desenha 16 de
// largura contra 20 do Instagram. Na mesma caixa ele lê como menor, então ganha
// ~14% para os dois pesarem igual na lista.
const SHIELD_ICON_CLS = 'w-8 h-8 sm:w-[22px] sm:h-[22px] shrink-0';

function inputCls(hasError?: boolean): string {
  return `${INPUT_CLS} ${
    hasError ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
  }`;
}

/**
 * Aceita só o que é telefone: dígitos e separadores, com "+" apenas no início.
 * Não é máscara — máscara fixa quebraria números da Áustria, da Suíça ou de
 * quem já está viajando, e atrapalha o autofill do celular.
 */
function sanitizePhone(value: string): string {
  const cleaned = value.replace(/[^\d+\s()/-]/g, '');
  const hasPlus = cleaned.trimStart().startsWith('+');
  return (hasPlus ? '+' : '') + cleaned.replace(/\+/g, '');
}

/**
 * Reage a quem cola o número completo ("+43 664 …", "0043 664 …") no campo
 * nacional: reconhece o DDI, troca o país selecionado e devolve só o resto.
 * DDI desconhecido cai em 'other' — ninguém fica travado.
 */
function detectCountry(value: string): { country: PhoneCountry; national: string } | null {
  const compact = value.replace(/\s/g, '');
  const intl = compact.startsWith('00') ? `+${compact.slice(2)}` : compact;
  if (!intl.startsWith('+')) return null;

  const match = PHONE_COUNTRIES.find(c => intl.startsWith(c.dial));
  if (!match) return { country: 'other', national: intl };

  // Corta o DDI contando dígitos no texto original: preservar os espaços que a
  // pessoa colou mantém o número legível no admin.
  const rest = value.replace(/^\s*(00|\+)\s*/, '');
  const dialDigits = match.dial.length - 1;
  let seen = 0;
  let i = 0;
  for (; i < rest.length && seen < dialDigits; i++) {
    if (/\d/.test(rest[i])) seen++;
  }
  return { country: match.code, national: rest.slice(i).trim() };
}

/** O 0 nacional alemão/austríaco não entra na forma internacional. */
function stripTrunkZero(value: string): string {
  return value.replace(/^0+\s*/, '');
}

/**
 * Separa o prefixo de celular do resto, para o número não virar um bloco só.
 *
 * Só age quando reconhece um prefixo móvel (DE 15x/16x/17x, AT 6xx, CH 7x) —
 * fixo alemão tem código de área de 2 a 5 dígitos e não dá para inferir sem
 * libphonenumber. Sem certeza, devolve null e o que a pessoa digitou fica.
 */
function groupNational(country: PhoneCountry, value: string): string | null {
  const digits = value.replace(/\D/g, '');

  if (country === 'DE') {
    const m = digits.match(/^(1[5-7]\d)(\d{1,8})$/);
    return m && `${m[1]} ${m[2]}`;
  }
  if (country === 'AT') {
    const m = digits.match(/^(6\d\d)(\d{1,8})$/);
    return m && `${m[1]} ${m[2]}`;
  }
  if (country === 'CH') {
    // Convenção suíça: 79 123 45 67
    const m = digits.match(/^(7[5-9])(\d{1,3})(\d{0,2})(\d{0,2})$/);
    return m && [m[1], m[2], m[3], m[4]].filter(Boolean).join(' ');
  }
  return null;
}

/** 'sambodromo' -> 'interestSambodromo' (chave no catálogo alemão). */
function interestKey(id: string): string {
  return `interest${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-2 leading-relaxed">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-7 border-t border-gray-100 first:pt-0 first:border-t-0">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {hint && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Contador com botões grandes: no celular ninguém quer digitar num number input. */
function Stepper({
  label,
  value,
  min,
  onChange,
  decLabel,
  incLabel,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
  decLabel: string;
  incLabel: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(99, v));
  const btnCls =
    'w-11 sm:w-12 shrink-0 flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      <div className="flex items-stretch h-12 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
        <button
          type="button"
          aria-label={`${label} — ${decLabel}`}
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          className={btnCls}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={99}
          value={value}
          onChange={e => onChange(clamp(parseInt(e.target.value) || min))}
          aria-label={label}
          className="flex-1 w-full min-w-0 text-center text-base font-semibold text-gray-900 border-x border-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`${label} — ${incLabel}`}
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= 99}
          className={btnCls}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Linha inteira clicável — alvo de toque confortável, não só a caixinha. */
function OptionTile({
  type,
  name,
  checked,
  onChange,
  children,
}: {
  type: 'radio' | 'checkbox';
  name?: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex items-center gap-3 min-h-[52px] px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
        checked
          ? 'border-green-600 bg-green-50/70'
          : 'border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50'
      }`}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className={`h-5 w-5 shrink-0 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-offset-0 ${
          type === 'checkbox' ? 'rounded' : 'rounded-full'
        }`}
      />
      <span className="text-[15px] leading-snug text-gray-800">{children}</span>
    </label>
  );
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
  const von = searchParams.get('von');
  const source = von === 'whatsapp' || von === 'email' || von === 'instagram' ? von : 'other';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('DE');
  const [phoneNormalized, setPhoneNormalized] = useState(false);
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

  // O banco guarda o número já em forma internacional: é dele que sai o link
  // wa.me no admin.
  const fullPhone = () => {
    const national = phone.trim();
    if (!national) return '';
    if (phoneCountry === 'other') return national;
    const dial = PHONE_COUNTRIES.find(c => c.code === phoneCountry)!.dial;
    return `${dial} ${stripTrunkZero(national)}`;
  };

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
          phone: fullPhone(),
          phoneCountry,
          pax,
          children,
          childrenAges: children > 0 ? childrenAges : '',
          preferredDay,
          interests,
          consent,
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
      <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 sm:py-12 pb-32 sm:pb-24">
        <div className="w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <h2 className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
              {t('successTitle', { name: name.trim().split(' ')[0] })}
            </h2>
            <p className="mt-3 text-[15px] text-gray-600 leading-relaxed">
              {t('successText')}
            </p>
          </div>

          {/* Recibo do que foi enviado: o que tranquiliza é ver os próprios dados de volta */}
          <div className="mt-6 rounded-2xl bg-blue-50/70 border border-blue-100 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              {t('successRecapTitle')}
            </p>
            <ul className="mt-3 space-y-2.5">
              <li className="flex items-center gap-3 text-[15px] text-gray-900">
                <CalendarDays className="w-4 h-4 shrink-0 text-blue-600" />
                {t('datesValue')}
              </li>
              <li className="flex items-center gap-3 text-[15px] text-gray-900">
                <Users className="w-4 h-4 shrink-0 text-blue-600" />
                {people}
              </li>
            </ul>
          </div>

          {/* Expectativa explícita: a espera aqui é de meses, não de dias */}
          <section className="mt-8">
            <h3 className="text-base font-semibold text-gray-900">{t('successStepsTitle')}</h3>
            <ol className="mt-4 space-y-3.5">
              {[t('successStep1'), t('successStep2'), t('successStep3')].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-[15px] text-gray-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {whatsappHref && (
            // Verde e glifo oficiais do WhatsApp, como no CTA de /kontakt:
            // o botão é reconhecido pela marca antes de ser lido.
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2.5 min-h-14 px-6 py-3 rounded-xl bg-[#25D366] text-white text-[15px] font-semibold shadow-sm shadow-[#25D366]/30 hover:bg-[#22c35e] active:bg-[#1eb055] transition-colors"
            >
              {/* Menor que os ícones do lucide de propósito: este glifo ocupa
                  as 24 unidades inteiras do viewBox, sem a margem que eles têm. */}
              <WhatsAppIcon className="w-6 h-6 sm:w-[18px] sm:h-[18px] shrink-0" />
              {/* No celular a frase quebra em duas linhas em vez de espremer */}
              <span className="flex flex-col leading-snug sm:flex-row sm:gap-1">
                <span>{t('successWhatsappQuestion')}</span>
                <span>{t('successWhatsappAction')}</span>
              </span>
            </a>
          )}

          {/* Nada a fazer agora — então ofereço leitura em vez de um beco sem saída */}
          <section className="mt-8 pt-7 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">{t('successMeanwhileTitle')}</h3>
            <div className="mt-4 space-y-2.5">
              {instagramHref && (
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_ROW_CLS}
                >
                  <Instagram className={`${ROW_ICON_CLS} text-[#ee2a7b]`} />
                  <span className="flex-1 leading-snug">
                    {t('successLinkInstagram')}
                    {instagramHandle && (
                      <span className="text-gray-400"> @{instagramHandle}</span>
                    )}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-gray-400" />
                </a>
              )}

              <Link href="/ist-rio-gefaehrlich" className={LINK_ROW_CLS}>
                <ShieldCheck className={`${SHIELD_ICON_CLS} text-emerald-600`} />
                <span className="flex-1 leading-snug">{t('successLinkSafety')}</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-gray-400" />
              </Link>
            </div>
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    // pb generoso: o banner de cookies é fixo no rodapé e não pode cobrir o botão
    <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 sm:py-12 pb-32 sm:pb-24">
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-10">
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
        <div className="mt-6 px-5 py-6 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-blue-100">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          {/* Cores sólidas: as variantes com opacidade caíam abaixo de 4.5:1
              de contraste nestes tamanhos pequenos. */}
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
            {t('datesLabel')}
          </p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900 text-balance">
            {t('datesValue')}
          </p>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            {t('datesHint')}
          </p>
        </div>

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

            <Field
              label={t('phoneLabel')}
              hint={phoneCountry === 'other' ? t('phoneOtherHint') : t('phoneHint')}
            >
              <div className="flex items-stretch h-12 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
                {/* O select nativo dimensiona a caixa pela opção mais larga
                    ("andere"), o que deixava o "+49" e a seta em pontas opostas.
                    O rótulo visível acompanha o valor; o select fica por cima,
                    invisível, para não perder o seletor nativo do celular. */}
                <div className="relative flex shrink-0 items-center gap-1.5 pl-4 pr-3 border-r border-gray-200 text-base text-gray-900">
                  <span>
                    {phoneCountry === 'other'
                      ? t('phoneCountryOther')
                      : PHONE_COUNTRIES.find(c => c.code === phoneCountry)!.dial}
                  </span>
                  <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                  <select
                    value={phoneCountry}
                    onChange={e => setPhoneCountry(e.target.value as PhoneCountry)}
                    aria-label={t('phoneCountryLabel')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {PHONE_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.dial}
                      </option>
                    ))}
                    <option value="other">{t('phoneCountryOther')}</option>
                  </select>
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={e => {
                    const clean = sanitizePhone(e.target.value);
                    setPhoneNormalized(false);
                    // Colou o número completo? Reconheço o DDI em vez de reclamar.
                    const detected = detectCountry(clean);
                    if (detected) {
                      setPhoneCountry(detected.country);
                      setPhone(groupNational(detected.country, detected.national) ?? detected.national);
                      return;
                    }
                    // Reagrupar com o cursor no meio do texto o faria pular para
                    // o fim; digitando no fim (o normal) isso não acontece.
                    const atEnd = e.target.selectionStart === e.target.value.length;
                    setPhone((atEnd && groupNational(phoneCountry, clean)) || clean);
                  }}
                  onBlur={() => {
                    if (phoneCountry === 'other') return;
                    const stripped = stripTrunkZero(phone);
                    setPhoneNormalized(stripped !== phone);
                    setPhone(groupNational(phoneCountry, stripped) ?? stripped);
                  }}
                  className="flex-1 w-full min-w-0 px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder={
                    phoneCountry === 'other' ? t('phoneOtherPlaceholder') : t('phonePlaceholder')
                  }
                  autoComplete="tel"
                />
              </div>
              {phoneNormalized && (
                <p className="mt-1.5 text-xs text-amber-700 leading-relaxed">
                  {t('phoneTrunkStripped')}
                </p>
              )}
            </Field>
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

          <Section title={t('preferredDayLabel')}>
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

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {t('privacyNote')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
