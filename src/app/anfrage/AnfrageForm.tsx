'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { isThema, type Thema } from '@/lib/themen';
import { isTourSlug } from '@/lib/tours';
import {
  FOUND_VIA_VALUES,
  INTERESSE_TOURS,
  UNENTSCHLOSSEN,
  type FoundVia,
  type Interesse,
} from '@/lib/interessen';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  Instagram,
  Clock,
  Loader2,
  Mail,
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
  textareaCls,
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

/** Sem o fundo cinza de página cheia: quem hospeda já tem o seu. */
function EmbeddedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-10">
      {children}
    </div>
  );
}

export default function AnfrageForm({
  whatsappHref,
  instagramHref,
  instagramHandle,
  embedded = false,
  defaultVon,
}: {
  whatsappHref: string;
  instagramHref: string;
  instagramHandle: string;
  /** Embutido em outra página (hoje só a /kontakt): o título vira h2, porque a
   *  página hospedeira já tem o h1, e o formulário larga o fundo de página
   *  cheia para caber dentro do layout dela. */
  embedded?: boolean;
  /** Canal de chegada quando a URL não traz ?von= — o caso da /kontakt, que é
   *  navegação interna e não campanha. */
  defaultVon?: string;
}) {
  const t = useTranslations('public.anfrage');
  const locale = useLocale();
  const searchParams = useSearchParams();
  // `von` = canal de chegada, `tour` = página de tour de onde o CTA partiu.
  // Ambos vão crus para a rota, que é quem valida — o formulário não decide
  // o que é válido, senão a lista de tours passa a viver em dois lugares.
  // Valor fora da lista é ignorado lá, sem quebrar o envio.
  const von = searchParams.get('von') ?? defaultVon ?? null;
  const tour = searchParams.get('tour');
  const thema = searchParams.get('thema');
  // Só o thema é validado aqui, e não pra decidir o que enviar (a rota é quem
  // valida) — é pra saber se dá pra mostrar um rótulo. Sem rótulo conhecido a
  // linha some, em vez de ecoar na tela um valor vindo da URL.
  //
  // Record<Thema, ...> com chamadas literais de propósito: o compilador cobra
  // um rótulo pra cada slug novo em THEMA_SLUGS, e o check:i18n consegue ver
  // as chaves. Montar o nome da chave por interpolação passaria batido nos
  // dois — o script conta isso como "chave dinâmica ignorada".
  // Chamadas t() literais, como nos temas: o compilador cobra rótulo pra cada
  // valor novo e o check:i18n enxerga as chaves. Montar o nome da chave por
  // função — que foi como escrevi primeiro — passa batido nos dois.
  const interesseLabels: Record<Interesse, string> = {
    klassiker: t('interesseKlassiker'),
    'natur-und-straende': t('interesseNaturUndStraende'),
    'favela-tour': t('interesseFavelaTour'),
    'kultur-und-geschichte': t('interesseKulturUndGeschichte'),
    fussball: t('interesseFussball'),
    tagesausfluege: t('interesseTagesausfluege'),
    unentschlossen: t('interesseUnentschlossen'),
  };
  const foundViaLabels: Record<FoundVia, string> = {
    google: t('foundViaGoogle'),
    ki: t('foundViaKi'),
    empfehlung: t('foundViaEmpfehlung'),
    social: t('foundViaSocial'),
    kreuzfahrt: t('foundViaKreuzfahrt'),
    sonstiges: t('foundViaSonstiges'),
  };

  const themaLabels: Record<Thema, string> = {
    unterkunft: t('themaUnterkunft'),
    transfer: t('themaTransfer'),
    'aussicht-natur': t('themaAussichtNatur'),
    'kunst-kultur': t('themaKunstKultur'),
    'postkarten-tour': t('themaPostkartenTour'),
    'berg-meer': t('themaBergMeer'),
    'natur-pur': t('themaNaturPur'),
    'geheimtipps': t('themaGeheimtipps'),
  };
  const themaLabel = isThema(thema) ? themaLabels[thema] : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('DE');
  const [pax, setPax] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState<string[]>([]);
  const [dayInput, setDayInput] = useState('');
  // Pré-seleção pelo ?tour= da URL: quem clicou o CTA de uma página de tour já
  // disse o que quer. Editável — é sugestão, não trava (o usuário pode ter
  // clicado na Favela e querer também os Klassiker).
  const [interessen, setInteressen] = useState<Interesse[]>(() =>
    isTourSlug(tour) && (INTERESSE_TOURS as readonly string[]).includes(tour)
      ? [tour as Interesse]
      : []
  );
  const [wunsch, setWunsch] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  /**
   * Funil view -> start -> submit. Sessão só na memória: nada de cookie ou
   * localStorage, então recarregar a página conta como visita nova — que é o
   * que interessa (uma pessoa que volta e desiste de novo é sinal, não ruído).
   */
  const sessionRef = useRef<string>('');
  const startedRef = useRef(false);
  if (!sessionRef.current && typeof crypto !== 'undefined') {
    sessionRef.current = crypto.randomUUID();
  }

  const trackAnfrage = (event: 'view' | 'start' | 'submit', extra?: Record<string, unknown>) => {
    if (!sessionRef.current) return;
    const payload = JSON.stringify({
      sessionId: sessionRef.current, event, von, tour, thema, ...extra,
    });
    // sendBeacon sobrevive ao fechamento da aba — essencial pra medir abandono.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/anfrage/events', new Blob([payload], { type: 'application/json' }));
      return;
    }
    fetch('/api/anfrage/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: payload, keepalive: true,
    }).catch(() => {});
  };

  /** 'start' no primeiro campo preenchido — é o que separa quem olhou de quem tentou. */
  const marcarStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackAnfrage('start');
  };
  const [foundVia, setFoundVia] = useState<FoundVia | null>(null);

  /**
   * "Ich weiß es noch nicht" e os temas são mutuamente exclusivos: quem pede
   * recomendação não está escolhendo, e um lead com os dois seria ruído na
   * hora de montar a proposta.
   */
  const toggleInteresse = (value: Interesse) => {
    marcarStart();
    setInteressen(prev => {
      if (value === UNENTSCHLOSSEN) {
        return prev.includes(UNENTSCHLOSSEN) ? [] : [UNENTSCHLOSSEN];
      }
      const semUnentschlossen = prev.filter(v => v !== UNENTSCHLOSSEN);
      return semUnentschlossen.includes(value)
        ? semUnentschlossen.filter(v => v !== value)
        : [...semUnentschlossen, value];
    });
  };

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
          source: von,
          tour,
          thema,
          interessen,
          wunsch,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t('errorGeneric'));
        return;
      }
      const novoLeadId = typeof data.leadId === 'string' ? data.leadId : null;
      trackAnfrage('submit', { leadId: novoLeadId });
      setLeadId(novoLeadId);
      setSubmitted(true);
    } catch {
      setError(t('errorNetwork'));
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { trackAnfrage('view'); }, []);

  /** Telemetria opcional: falha em silêncio, nunca atrapalha quem já converteu. */
  const responderFoundVia = (value: FoundVia) => {
    setFoundVia(value);
    if (!leadId) return;
    fetch('/api/anfrage/found-via', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, value }),
    }).catch(() => {});
  };

  if (submitted) {
    const waText = encodeURIComponent(
      t('successWhatsappPrefill', {
        name: name.trim().split(' ')[0],
        datum: days.map(d => formatGermanDay(d, locale)).join(', '),
      })
    );
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
          {interessen.length > 0 && (
            <RecapRow icon={<Compass className="w-4 h-4" />}>
              {interessen
                .map(v => interesseLabels[v])
                .join(' · ')}
            </RecapRow>
          )}
        </RecapBox>


        <NextSteps
          title={t('successStepsTitle')}
          steps={[t('successStep1'), t('successStep2'), t('successStep3')]}
        />

        {/* Colado no passo que promete a resposta por e-mail, e antes do botão
            de WhatsApp — que é justamente a saída para quem não quiser depender
            de caixa de entrada. Âmbar e não vermelho: é um lembrete, não um
            erro; a pessoa acabou de converter e não pode achar que algo falhou.
            Enquanto a Fase 4 (SPF/DKIM/DMARC + provedor transacional) não
            existir, a entregabilidade é frágil de verdade e o aviso se paga. */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[15px] font-semibold text-amber-900 leading-snug">
              {t('successSpamTitel')}
            </p>
            <p className="mt-0.5 text-[14px] text-amber-900/80 leading-relaxed">
              {t('successSpamHinweis')}
            </p>
          </div>
        </div>

        {whatsappHref && (
          <WhatsAppCta
            href={`${whatsappHref}?text=${waText}`}
            question={t('successWhatsappQuestion')}
            action={t('successWhatsappAction')}
          />
        )}

        {/* "Wie hast du uns gefunden?" mora AQUI e não no formulário: depois do
            envio a pessoa já converteu, não há o que abandonar, e o formulário
            não cresce (67% dos visitantes estão no celular). Campo opcional —
            some assim que responde, sem confirmação que roube a atenção do
            botão de WhatsApp. */}
        {leadId && (
          <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
            {foundVia ? (
              <p className="text-[15px] font-medium text-gray-700">{t('foundViaDanke')}</p>
            ) : (
              <>
                <p className="text-[15px] font-medium text-gray-800">{t('foundViaFrage')}</p>
                <p className="mt-0.5 text-[13px] text-gray-500">{t('foundViaHint')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FOUND_VIA_VALUES.map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => responderFoundVia(value)}
                      className="min-h-11 px-4 py-2 rounded-full border border-gray-200 bg-white text-[15px] text-gray-700 hover:border-gray-300 active:bg-gray-50 transition-colors"
                    >
                      {foundViaLabels[value]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <MeanwhileSection title={t('successMeanwhileTitle')}>
          {/* O link para /touren saiu: quem acabou de pedir uma tour não precisa
              voltar a navegar o catálogo — isso reabre uma decisão que a pessoa
              já tomou. Ficam o conteúdo de leitura e o Instagram, que são
              espera e prova social, não uma segunda escolha. */}
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

  const Shell = embedded ? EmbeddedShell : FormShell;
  const Heading = embedded ? 'h2' : 'h1';

  return (
    <Shell>
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          {t('badge')}
        </span>
        <Heading className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight text-balance">
          {t('title')}
        </Heading>
      </header>

      {/* Quem chega por um CTA de assunto específico (hoje só a consultoria de
          hospedagem) precisa ver que o pedido dele chegou — senão cai num
          formulário que só fala de tour, acha que errou de página e desiste.
          Sem isso o teste de demanda mediria a fricção da tela, não o
          interesse pelo serviço. */}
      {themaLabel && (
        <p className="mt-4 text-center text-sm text-gray-600">
          {t('themaContext')}{' '}
          <strong className="font-semibold text-gray-900">{themaLabel}</strong>
        </p>
      )}

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
              onChange={e => { setName(e.target.value); clearFieldError('name'); marcarStart(); }}
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
              onChange={e => { setEmail(e.target.value); clearFieldError('email'); marcarStart(); }}
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

        {/* Multi-select de temas. Coluna única, tiles de 52px: em 380px (67% dos
            visitantes estão no celular) duas colunas dariam ~170px por alvo e
            "Kultur & Geschichte" quebraria em duas linhas. Scroll custa menos
            que polegar errando. */}
        <Section title={t('interessenLabel')} hint={t('interessenHint')}>
          <fieldset className="space-y-2.5">
            <legend className="sr-only">{t('interessenLabel')}</legend>

            {INTERESSE_TOURS.map(slug => (
              <OptionTile
                key={slug}
                type="checkbox"
                checked={interessen.includes(slug)}
                onChange={() => toggleInteresse(slug)}
              >
                {interesseLabels[slug]}
                {slug === 'klassiker' && (
                  <span className="block text-[13px] text-gray-500">
                    {t('interesseKlassikerHint')}
                  </span>
                )}
                {/* Sem esta linha, "Fußballspiel" excluiria quem quer conhecer o
                    estádio sem jogo marcado — a tour cobre os dois casos. */}
                {slug === 'fussball' && (
                  <span className="block text-[13px] text-gray-500">
                    {t('interesseFussballHint')}
                  </span>
                )}
              </OptionTile>
            ))}

            {/* Respiro acima, mas tile idêntico: peso visual igual aos temas,
                sem ser lido como um oitavo tema. É posicionamento do negócio,
                não escapatória. */}
            <div className="pt-1.5">
              <OptionTile
                type="checkbox"
                checked={interessen.includes(UNENTSCHLOSSEN)}
                onChange={() => toggleInteresse(UNENTSCHLOSSEN)}
              >
                {t('interesseUnentschlossen')}
              </OptionTile>
            </div>
          </fieldset>

          <div className="mt-5">
            <Field label={t('wunschLabel')}>
              <textarea
                value={wunsch}
                onChange={e => setWunsch(e.target.value.slice(0, 500))}
                rows={3}
                placeholder={t('wunschPlaceholder')}
                className={`${textareaCls()} resize-none`}
              />
            </Field>
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

          {/* Prazo acima do botão, não no rodapé: é o que responde "e depois?"
              no momento exato da hesitação. */}
          <p className="flex items-start gap-2 text-[15px] text-gray-700 leading-snug">
            <Clock className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
            {t('antwortVersprechen')}
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 h-14 px-6 bg-green-600 text-white text-base font-semibold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? t('submitting') : t('submit')}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">{t('privacyNote')}</p>

          {/* Impressum perto do formulário: alemão confere quem está do outro
              lado, e a ausência lê como desconfiança. */}
          <p className="text-center">
            <Link
              href="/impressum"
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition-colors"
            >
              {t('impressumHinweis')}
            </Link>
          </p>
        </div>
      </form>
    </Shell>
  );
}
