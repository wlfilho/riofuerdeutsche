'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CheckCircle2, AlertCircle, Heart, MessageSquareHeart } from 'lucide-react';

interface NpsData {
    nickname: string;
    tour_date: string | null;
    used_at: string | null;
}

function NpsFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    
    const [loading, setLoading] = useState(true);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [nps, setNps] = useState<NpsData | null>(null);
    
    const [score, setScore] = useState<number | null>(null);
    const [bestPart, setBestPart] = useState('');
    const [improvement, setImprovement] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [finalScore, setFinalScore] = useState<number>(0);

    const supabase = createClient();

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setLoading(false);
            return;
        }
        
        const fetchNps = async () => {
            const { data, error } = await supabase
                .from('nps_responses')
                .select('nickname, tour_date, used_at')
                .eq('token', token)
                .single();
            
            if (error || !data || data.used_at) {
                setTokenValid(false);
            } else {
                setNps(data);
                setTokenValid(true);
            }
            setLoading(false);
        };
        
        fetchNps();
    }, [token, supabase]);

    const handleSubmit = async () => {
        if (score === null || bestPart.trim().length === 0 || !token) return;
        setIsSubmitting(true);

        const redirected = score >= 9;

        try {
            const { error } = await supabase
                .from('nps_responses')
                .update({
                    score,
                    best_part: bestPart.trim(),
                    improvement: improvement.trim() || null,
                    used_at: new Date().toISOString(),
                    redirected_to_review: redirected,
                })
                .eq('token', token);

            if (error) throw error;

            setSubmitted(true);
            setFinalScore(score);

            // Redirecionar automaticamente se score >= 9
            if (redirected) {
                setTimeout(() => {
                    router.push('/bewertung-schreiben');
                }, 2500);
            }
        } catch (err) {
            console.error('Error submitting NPS:', err);
            alert('Ups! Etwas ist schief gelaufen. Bitte versuche es später noch einmal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
                <p className="text-gray-500 font-medium">Einen Moment bitte...</p>
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
                        Link nicht gültig
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Dieser Link wurde bereits verwendet oder existiert nicht. Wenn du Fragen hast, melde dich bitte bei Will.
                    </p>
                    <Link href="/" className="mt-8 inline-block text-sm font-bold text-yellow-600 hover:text-yellow-700 underline decoration-yellow-400">
                        Zurück zur Startseite
                    </Link>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 transition-all duration-500 animate-in fade-in zoom-in-95">
                    
                    {/* Score 9-10 */}
                    {finalScore >= 9 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Vielen Dank, {nps?.nickname}!
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Das freut mich riesig! Hättest du noch 2 Minuten Zeit für 
                                eine kurze Bewertung auf meiner Website? 
                                <br />Du wirst gleich weitergeleitet...
                            </p>
                            <button 
                                onClick={() => router.push('/bewertung-schreiben')}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95"
                            >
                                Jetzt Bewertung schreiben →
                            </button>
                            <Link href="/" className="block mt-6 text-sm font-bold text-gray-400 hover:text-gray-600">
                                Zurück zur Startseite
                            </Link>
                        </div>
                    )}

                    {/* Score 7-8 */}
                    {finalScore >= 7 && finalScore <= 8 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 font-bold">
                                <span className="text-4xl">😊</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Vielen Dank, {nps?.nickname}!
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                Schön, dass es dir gefallen hat! Dein Feedback hilft mir, 
                                noch bessere Touren anzubieten. Ich hoffe, wir sehen uns 
                                bald wieder in Rio!
                            </p>
                            <Link href="/" className="mt-8 inline-block text-sm font-bold text-yellow-600 hover:text-yellow-700">
                                Zurück zur Website
                            </Link>
                        </div>
                    )}

                    {/* Score 0-6 */}
                    {finalScore <= 6 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">🙏</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                Vielen Dank für dein ehrliches Feedback, {nps?.nickname}!
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                Deine Rückmeldung ist wertvoll und hilft mir, meine Touren 
                                zu verbessern. Ich nehme dein Feedback sehr ernst.
                            </p>
                            <Link href="/" className="mt-8 inline-block text-sm font-bold text-gray-400 hover:text-gray-600">
                                Beenden
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    <div className="p-8 md:p-10">
                        {/* Cabeçalho */}
                        <div className="text-center mb-10">
                            <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                                Feedback-Formular
                            </p>
                            <div className="flex justify-center mb-4">
                                <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[11px] font-bold text-gray-400">
                                    Hallo {nps?.nickname}!
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                                Wie war deine Tour mit Will?
                            </h1>
                            <p className="text-gray-500 text-sm mt-3">
                                3 kurze Fragen — dauert weniger als eine Minute.
                            </p>
                        </div>

                        <form className="space-y-10">
                            {/* Pergunta 1 — NPS */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-800 leading-snug">
                                    Wie wahrscheinlich ist es, dass du Will als Guide 
                                    an Freunde oder Familie weiterempfiehlst?
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
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Gar nicht wahrscheinlich</span>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Sehr wahrscheinlich</span>
                                </div>
                            </div>

                            {/* Pergunta 2 — O que gostou mais */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-800">
                                    Was hat dir an der Tour am besten gefallen?
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <textarea
                                    value={bestPart}
                                    onChange={e => setBestPart(e.target.value)}
                                    rows={4}
                                    placeholder="z.B. die persönlichen Tipps, die Atmosphäre, die Orte..."
                                    className="w-full border border-gray-100 bg-gray-50/30 rounded-2xl px-4 py-3 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all resize-none leading-relaxed"
                                />
                                <p className="text-[10px] text-gray-400 text-right">Erzähl es uns in deinen eigenen Worten.</p>
                            </div>

                            {/* Pergunta 3 — Sugestão de melhoria */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-800">
                                    Gibt es etwas, das wir beim nächsten Mal besser machen könnten?
                                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                                </label>
                                <textarea
                                    value={improvement}
                                    onChange={e => setImprovement(e.target.value)}
                                    rows={3}
                                    placeholder="Dein Feedback hilft uns, noch besser zu werden."
                                    className="w-full border border-gray-100 bg-gray-50/30 rounded-2xl px-4 py-3 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all resize-none leading-relaxed"
                                />
                            </div>

                            {/* Botão submit */}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={score === null || bestPart.trim().length === 0 || isSubmitting}
                                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-100
                                    disabled:text-gray-400 text-gray-900 font-bold rounded-2xl transition-all shadow-sm hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Wird gesendet...
                                    </>
                                ) : (
                                    'Bewertung absenden'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                
                <div className="mt-12 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                    &copy; Rio für Deutsche &mdash; Rio de Janeiro Experte
                </div>
            </div>
        </div>
    );
}

// Wrapper for Suspense to handle useSearchParams
import Link from 'next/link';
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
