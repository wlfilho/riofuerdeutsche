'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

const INPUT_CLS =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

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

export default function AnfrageForm() {
  const t = useTranslations('public.anfrage');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const von = searchParams.get('von');
  const source = von === 'whatsapp' || von === 'email' || von === 'instagram' ? von : 'other';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState<string[]>([]);
  const [dayInput, setDayInput] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addDay = () => {
    if (!dayInput) return;
    setDays(prev => (prev.includes(dayInput) ? prev : [...prev, dayInput].sort()));
    setDayInput('');
  };

  const removeDay = (d: string) => setDays(prev => prev.filter(x => x !== d));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError(t('errorName')); return; }
    if (!email.trim()) { setError(t('errorEmail')); return; }
    if (days.length === 0) { setError(t('errorDays')); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, pax, children, days, source, website }),
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('successTitle', { name: name.trim().split(' ')[0] })}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('successText')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {t('intro')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('nameLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={INPUT_CLS}
              placeholder={t('namePlaceholder')}
              autoComplete="name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={INPUT_CLS}
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneLabel')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={INPUT_CLS}
                placeholder={t('phonePlaceholder')}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('adultsLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={pax}
                onChange={e => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('childrenLabel')}</label>
              <input
                type="number"
                min="0"
                max="99"
                value={children}
                onChange={e => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('daysLabel')} <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              {t('daysHint')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                min={todayIso()}
                value={dayInput}
                onChange={e => setDayInput(e.target.value)}
                className={`${INPUT_CLS} max-w-xs`}
              />
              <button
                type="button"
                onClick={addDay}
                disabled={!dayInput}
                className="px-4 py-2.5 text-sm font-semibold bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {t('addDay')}
              </button>
            </div>
            {days.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {days.map(d => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-medium"
                  >
                    {formatGermanDay(d, locale)}
                    <button
                      type="button"
                      onClick={() => removeDay(d)}
                      title={t('removeDay')}
                      className="text-green-400 hover:text-red-500 transition-colors leading-none"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

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
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? t('submitting') : t('submit')}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            {t('privacyNote')}
          </p>
        </form>
      </div>
    </div>
  );
}
