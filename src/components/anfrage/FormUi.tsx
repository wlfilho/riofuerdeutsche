'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Minus, Plus } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { PHONE_COUNTRIES, type PhoneCountry } from '@/lib/campaigns';

/**
 * Peças de interface dos formulários públicos de Anfrage.
 *
 * Nasceram no formulário da campanha AIDA e moram aqui para que o formulário
 * geral e os das próximas campanhas tenham exatamente a mesma cara — e não
 * duas cópias que envelhecem separadas. Nada aqui conhece i18n: todo texto
 * chega por prop, para cada formulário manter o seu próprio catálogo.
 */

// text-base (16px) não é escolha estética: abaixo disso o Safari no iPhone dá
// zoom no campo ao focar e o layout sai do lugar. h-12 mantém o alvo de toque
// nos 48px recomendados.
const FIELD_BASE =
  'w-full px-4 bg-white border rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent';

export const INPUT_CLS = `${FIELD_BASE} h-12`;

/**
 * Textarea NÃO herda o `h-12` do input: altura fixa de uma linha anulava o
 * `rows` e prendia o placeholder no topo da caixa. Aqui a altura vem do `rows`
 * e o py-3 dá ao texto a mesma folga vertical que o input de uma linha tem.
 *
 * Não dá pra resolver acrescentando `h-auto` na string de classes: Tailwind
 * decide pela ordem no CSS gerado, não pela ordem no atributo, então o `h-12`
 * poderia continuar ganhando.
 */
export const TEXTAREA_CLS = `${FIELD_BASE} py-3 leading-relaxed`;

export const LINK_ROW_CLS =
  'flex items-center gap-3 min-h-[52px] px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors';

// No celular o rótulo dessas linhas quebra em duas; o ícone cresce junto para
// acompanhar a altura do texto em vez de flutuar pequeno ao lado dele.
export const ROW_ICON_CLS = 'w-7 h-7 sm:w-5 sm:h-5 shrink-0';

// Compensação óptica: no viewBox de 24, o escudo do lucide desenha 16 de
// largura contra 20 do Instagram. Na mesma caixa ele lê como menor, então ganha
// ~14% para os dois pesarem igual na lista.
export const SHIELD_ICON_CLS = 'w-8 h-8 sm:w-[22px] sm:h-[22px] shrink-0';

/** Moldura da página: fundo, respiro e o cartão branco central. */
export function FormShell({ children }: { children: React.ReactNode }) {
  return (
    // pb generoso: o banner de cookies é fixo no rodapé e não pode cobrir o botão
    <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 sm:py-12 pb-32 sm:pb-24">
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-10">
        {children}
      </div>
    </div>
  );
}

export function textareaCls(hasError?: boolean): string {
  return `${TEXTAREA_CLS} ${
    hasError ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
  }`;
}

export function inputCls(hasError?: boolean): string {
  return `${INPUT_CLS} ${
    hasError ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
  }`;
}

export function Field({
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

export function Section({
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
export function Stepper({
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
export function OptionTile({
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

/** Caixa azul de destaque — o fato que qualifica a página antes do formulário. */
export function HighlightBox({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="mt-6 px-5 py-6 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
      <div className="mx-auto w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-blue-100">
        {icon}
      </div>
      {/* Cores sólidas: as variantes com opacidade caíam abaixo de 4.5:1
          de contraste nestes tamanhos pequenos. */}
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <p className="mt-1 text-lg sm:text-xl font-bold text-gray-900 text-balance">{value}</p>
      {hint && (
        <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">{hint}</p>
      )}
    </div>
  );
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

/**
 * Forma internacional do número, que é o que vai para o banco: é dela que sai
 * o link wa.me no admin.
 */
export function toInternationalPhone(country: PhoneCountry, national: string): string {
  const trimmed = national.trim();
  if (!trimmed) return '';
  if (country === 'other') return trimmed;
  const dial = PHONE_COUNTRIES.find(c => c.code === country)!.dial;
  return `${dial} ${stripTrunkZero(trimmed)}`;
}

export interface PhoneFieldLabels {
  label: string;
  hint: string;
  hintOther: string;
  countryLabel: string;
  countryOther: string;
  placeholder: string;
  placeholderOther: string;
  trunkStripped: string;
}

/** Campo de telefone com seletor de DDI e correção silenciosa do formato. */
export function PhoneField({
  phone,
  country,
  onChange,
  labels,
}: {
  phone: string;
  country: PhoneCountry;
  onChange: (next: { phone: string; country: PhoneCountry }) => void;
  labels: PhoneFieldLabels;
}) {
  // Aviso puramente visual do que acabou de ser corrigido: não interessa a
  // quem envia o formulário, só a quem está digitando.
  const [normalized, setNormalized] = useState(false);

  return (
    <Field label={labels.label} hint={country === 'other' ? labels.hintOther : labels.hint}>
      <div className="flex items-stretch h-12 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
        {/* O select nativo dimensiona a caixa pela opção mais larga
            ("andere"), o que deixava o "+49" e a seta em pontas opostas.
            O rótulo visível acompanha o valor; o select fica por cima,
            invisível, para não perder o seletor nativo do celular. */}
        <div className="relative flex shrink-0 items-center gap-1.5 pl-4 pr-3 border-r border-gray-200 text-base text-gray-900">
          <span>
            {country === 'other'
              ? labels.countryOther
              : PHONE_COUNTRIES.find(c => c.code === country)!.dial}
          </span>
          <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
          <select
            value={country}
            onChange={e => onChange({ phone, country: e.target.value as PhoneCountry })}
            aria-label={labels.countryLabel}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {PHONE_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.dial}
              </option>
            ))}
            <option value="other">{labels.countryOther}</option>
          </select>
        </div>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={e => {
            const clean = sanitizePhone(e.target.value);
            setNormalized(false);
            // Colou o número completo? Reconheço o DDI em vez de reclamar.
            const detected = detectCountry(clean);
            if (detected) {
              onChange({
                country: detected.country,
                phone: groupNational(detected.country, detected.national) ?? detected.national,
              });
              return;
            }
            // Reagrupar com o cursor no meio do texto o faria pular para
            // o fim; digitando no fim (o normal) isso não acontece.
            const atEnd = e.target.selectionStart === e.target.value.length;
            onChange({ country, phone: (atEnd && groupNational(country, clean)) || clean });
          }}
          onBlur={() => {
            if (country === 'other') return;
            const stripped = stripTrunkZero(phone);
            setNormalized(stripped !== phone);
            onChange({ country, phone: groupNational(country, stripped) ?? stripped });
          }}
          className="flex-1 w-full min-w-0 px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
          placeholder={country === 'other' ? labels.placeholderOther : labels.placeholder}
          autoComplete="tel"
        />
      </div>
      {normalized && (
        <p className="mt-1.5 text-xs text-amber-700 leading-relaxed">{labels.trunkStripped}</p>
      )}
    </Field>
  );
}

/** Recibo do que foi enviado: o que tranquiliza é ver os próprios dados de volta */
export function RecapBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl bg-blue-50/70 border border-blue-100 px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{title}</p>
      <ul className="mt-3 space-y-2.5">{children}</ul>
    </div>
  );
}

export function RecapRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 text-[15px] text-gray-900">
      <span className="shrink-0 mt-[3px] text-blue-600">{icon}</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Expectativa explícita do que acontece depois do envio. */
export function NextSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="mt-8">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <ol className="mt-4 space-y-3.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-[15px] text-gray-600 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WhatsAppCta({
  href,
  question,
  action,
}: {
  href: string;
  question: string;
  action: string;
}) {
  return (
    // Verde e glifo oficiais do WhatsApp, como no CTA de /kontakt:
    // o botão é reconhecido pela marca antes de ser lido.
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 flex items-center justify-center gap-2.5 min-h-14 px-6 py-3 rounded-xl bg-[#25D366] text-white text-[15px] font-semibold shadow-sm shadow-[#25D366]/30 hover:bg-[#22c35e] active:bg-[#1eb055] transition-colors"
    >
      {/* Menor que os ícones do lucide de propósito: este glifo ocupa
          as 24 unidades inteiras do viewBox, sem a margem que eles têm. */}
      <WhatsAppIcon className="w-6 h-6 sm:w-[18px] sm:h-[18px] shrink-0" />
      {/* No celular a frase quebra em duas linhas em vez de espremer */}
      <span className="flex flex-col leading-snug sm:flex-row sm:gap-1">
        <span>{question}</span>
        <span>{action}</span>
      </span>
    </a>
  );
}

/** Nada a fazer agora — então ofereço leitura em vez de um beco sem saída */
export function MeanwhileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 pt-7 border-t border-gray-100">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <div className="mt-4 space-y-2.5">{children}</div>
    </section>
  );
}

export function LinkRow({
  href,
  external,
  icon,
  children,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const content = (
    <>
      {icon}
      <span className="flex-1 leading-snug">{children}</span>
      <ArrowRight className="w-4 h-4 shrink-0 text-gray-400" />
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_ROW_CLS}>
      {content}
    </a>
  ) : (
    <Link href={href} className={LINK_ROW_CLS}>
      {content}
    </Link>
  );
}
