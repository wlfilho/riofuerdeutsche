'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ReviewFormInline from '@/app/bewertung-schreiben/ReviewFormInline';

type Step = 'nps' | 'bewertung' | 'done';

function NpsFormContent() {
    const t = useTranslations('public.nps');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(!!token);
    const [tokenValid, setTokenValid] = useState<boolean | null>(token ? null : true);

    // When arriving via token, nickname comes from DB. Without token, user types it.
    const [nickname, setNickname] = useState('');
    const [tourDate, setTourDate] = useState<string | null>(null);

    const [step, setStep] = useState<Step>('nps');
    const [score, setScore] = useState<number | null>(null);
    const [bestPart, setBestPart] = useState('');
    const [improvement, setImprovement] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalScore, setFinalScore] = useState<number>(0);

    useEffect(() => {
        if (!token) return;
        const fetchNps = async () => {
            try {
                const res = await fetch(`/api/nps?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (!res.ok || !data.valid) {
                    setTokenValid(false);
                } else {
                    setNickname(data.nickname);
                    setTourDate(data.tour_date);
                    setTokenValid(true);
                }
            } catch {
                setTokenValid(false);
            }
            setLoading(false);
        };
        fetchNps();
    }, [token]);

    const handleSubmit = async () => {
        if (score === null || bestPart.trim().length === 0) return;
        if (!nickname.trim()) return;
        setIsSubmitting(true);

        const redirected = score >= 9;

        try {
            const res = await fetch('/api/nps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token || undefined,
                    nickname: nickname.trim(),
                    score,
                    best_part: bestPart.trim(),
                    improvement: improvement.trim() || null,
                    redirected_to_review: redirected,
                }),
            });
            if (!res.ok) throw new Error('NPS submit failed');

            setFinalScore(score);
            if (redirected) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep('bewertung');
            } else {
                setStep('done');
            }
        } catch (err) {
            console.error('Error submitting NPS:', err);
            alert(t('submitError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
                <p className="text-gray-500 font-medium">{t('loading')}</p>
            </div>
        );
    }

    if (tokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 text-2xl">
                        🤔
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {t('invalidTokenTitle')}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {t('invalidTokenText')}
                    </p>
                    <Link href="/" className="mt-8 inline-block text-sm font-bold text-yellow-600 hover:text-yellow-700 underline decoration-yellow-400">
                        {t('backHome')}
                    </Link>
                </div>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in-95">
                    {finalScore >= 9 ? (
                        <>
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('thanksTitle', { name: nickname })}
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                Deine Bewertung wurde erfolgreich eingereicht. Wir freuen uns riesig über dein Feedback!
                            </p>
                        </>
                    ) : finalScore >= 7 ? (
                        <>
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                😊
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {t('thanksTitle', { name: nickname })}
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                Schön, dass es dir gefallen hat! Dein Feedback hilft mir,
                                noch bessere Touren anzubieten. Ich hoffe, wir sehen uns
                                bald wieder in Rio!
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                🙏
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                {t('thanksHonestTitle', { name: nickname })}
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                Deine Rückmeldung ist wertvoll und hilft mir, meine Touren
                                zu verbessern. Ich nehme dein Feedback sehr ernst.
                            </p>
                        </>
                    )}
                    <Link href="/" className="mt-8 inline-block text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        {t('backHome')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                    {step === 'nps' && (
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-10">
                                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                                    {t('formLabel')}
                                </p>
                                {nickname ? (
                                    <div className="flex justify-center mb-4">
                                        <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[11px] font-bold text-gray-400">
                                            {t('hello', { name: nickname })}
                                        </div>
                                    </div>
                                ) : null}
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                                    {t('title')}
                                </h1>
                                <p className="text-gray-500 text-sm mt-3">
                                    {t('subtitle')}
                                </p>
                            </div>

                            <div className="space-y-10">
                                {/* Name field — only shown when no token */}
                                {!token && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-800">
                                            {t('nameLabel')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={e => setNickname(e.target.value)}
                                            placeholder={t('namePlaceholder')}
                                            className="w-full border border-gray-100 bg-gray-50/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                                        />
                                    </div>
                                )}

                                {/* NPS score */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-800 leading-snug">
                                        {t('scoreLabel')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                                        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setScore(n)}
                                                className={`
                                                    aspect-square flex items-center justify-center rounded-xl text-sm font-bold border-2 transition-all
                                                    ${score === n
                                                        ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/20 scale-105'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-yellow-200 hover:text-gray-600 hover:bg-yellow-50/30'}
                                                `}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{t('scoreMin')}</span>
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{t('scoreMax')}</span>
                                    </div>
                                </div>

                                {/* Best part */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-800">
                                        {t('bestPartLabel')}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                        value={bestPart}
                                        onChange={e => setBestPart(e.target.value)}
                                        rows={4}
                                        placeholder={t('bestPartPlaceholder')}
                                        className="w-full border border-gray-100 bg-gray-50/30 rounded-2xl px-4 py-3 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all resize-none leading-relaxed"
                                    />
                                    <p className="text-[10px] text-gray-400 text-right">{t('bestPartHint')}</p>
                                </div>

                                {/* Improvement */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-800">
                                        {t('improvementLabel')}
                                        <span className="text-gray-400 font-normal ml-1">{t('improvementOptional')}</span>
                                    </label>
                                    <textarea
                                        value={improvement}
                                        onChange={e => setImprovement(e.target.value)}
                                        rows={3}
                                        placeholder={t('improvementPlaceholder')}
                                        className="w-full border border-gray-100 bg-gray-50/30 rounded-2xl px-4 py-3 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Stepper — only when score >= 9 */}
                                {score !== null && score >= 9 && (
                                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
                                                <span className="text-xs font-black text-black">1</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{t('stepFeedback')}</span>
                                        </div>
                                        <div className="flex-1 h-0.5 bg-yellow-300 rounded-full" />
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-7 h-7 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center">
                                                <span className="text-xs font-black text-yellow-500">2</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{t('stepReview')}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={score === null || bestPart.trim().length === 0 || !nickname.trim() || isSubmitting}
                                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-100
                                        disabled:text-gray-400 text-gray-900 font-bold rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" />{t('submitting')}</>
                                    ) : score !== null && score >= 9 ? (
                                        t('continueToReview')
                                    ) : (
                                        t('submit')
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'bewertung' && (
                        <>
                            <div className="px-8 md:px-10 pt-8 md:pt-10 text-center">
                                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                                    {t('step2Label')}
                                </p>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                                    {t('step2Title')}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {t('step2Subtitle')}
                                </p>
                            </div>
                            <ReviewFormInline
                                nickname={nickname}
                                onSuccess={() => {
                                    setStep('done');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </>
                    )}
                </div>

                <div className="mt-12 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                    {t('footer')}
                </div>
            </div>
        </div>
    );
}

export default function NpsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
            </div>
        }>
            <NpsFormContent />
        </Suspense>
    );
}
