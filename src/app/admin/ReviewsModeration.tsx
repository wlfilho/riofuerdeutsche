'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Star, CheckCircle, XCircle, Clock, MessageSquare, 
    ChevronDown, ChevronUp, ExternalLink, Trash2, Plus, 
    Loader2, Link as LinkIcon, Copy, User, Calendar, Smile, Frown, Meh, MessageSquareHeart
} from 'lucide-react';

const ATTRACTIONS = [
  "Arcos da Lapa",
  "Arpoador-Felsen",
  "Botanischer Garten",
  "Búzios",
  "Christus-Erlöser",
  "Dona Marta Aussichtspunkt",
  "Escadaria Selarón",
  "Favela Rocinha",
  "Favela Vidigal",
  "Flamengo-Museum",
  "Fußballspiel im Stadion",
  "Grumari Strand",
  "Ilha Grande",
  "Laguna Rodrigo de Freitas",
  "Maracanã Stadion & Museum",
  "Museum von Morgen",
  "Niterói",
  "Paraty",
  "Parque Lage",
  "Pedra Bonita Wanderung",
  "Pedra da Gávea Wanderung",
  "Petrópolis",
  "Praia Vermelha (Roter Strand)",
  "Prainha Strand",
  "Real Gabinete Português",
  "Rio Kunstmuseum (MAR)",
  "Santa Teresa Viertel",
  "Theatro Municipal",
  "Tijuca-Regenwald",
  "Urca Viertel",
  "Zuckerhut",
  "Zwei-Brüder-Berg (Dois Irmãos)",
];

type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface Review {
    id: string;
    created_at: string;
    attractions: string[];
    nickname: string;
    email: string;
    rating: number;
    title: string;
    body: string;
    status: ReviewStatus;
    photo_urls?: string[];
    will_photo_urls?: string[];
    consent_own_photos?: boolean;
    consent_will_photos?: boolean;
}

interface NpsResponse {
    id: string;
    token: string;
    nickname: string;
    tour_date: string | null;
    score: number | null;
    best_part: string | null;
    redirected_to_review: boolean;
    used_at: string | null;
    created_at: string;
}

export default function ReviewsModeration() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [editingAttractions, setEditingAttractions] = useState<Record<string, string[]>>({});
    const [showAttractionPicker, setShowAttractionPicker] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    // NPS States
    const [npsNickname, setNpsNickname] = useState('');
    const [npsTourDate, setNpsTourDate] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [npsResponses, setNpsResponses] = useState<NpsResponse[]>([]);
    const [loadingNps, setLoadingNps] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/reviews?status=${encodeURIComponent(activeTab)}&full=1`, {
                method: 'GET',
                cache: 'no-store'
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to fetch reviews');
            }

            const fetchedReviews: Review[] = Array.isArray(payload?.reviews) ? payload.reviews : [];
            setReviews(fetchedReviews);
            const initialMap: Record<string, string[]> = {};
            fetchedReviews.forEach(r => {
                initialMap[r.id] = r.attractions || [];
            });
            setEditingAttractions(initialMap);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
            setEditingAttractions({});
        }
        setLoading(false);
    };

    const fetchNpsResponses = async () => {
        setLoadingNps(true);
        const { data, error } = await supabase
            .from('nps_responses')
            .select('id, token, nickname, tour_date, score, best_part, redirected_to_review, used_at, created_at')
            .order('created_at', { ascending: false })
            .limit(40);

        if (error) {
            console.error('Error fetching NPS:', error);
        } else {
            setNpsResponses(data || []);
        }
        setLoadingNps(false);
    };

    useEffect(() => {
        fetchReviews();
        fetchNpsResponses();
    }, [activeTab]);

    const handleApprove = async (id: string) => {
        setActioningId(id);
        const finalAttractions = editingAttractions[id] || [];
        try {
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    attractions: finalAttractions
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to approve review');
            }
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error approving review:', error);
            alert('Erro ao aprovar review');
        } finally {
            setActioningId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Deseja realmente rejeitar esta avaliação?')) return;
        
        setActioningId(id);
        try {
            const response = await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject' })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to reject review');
            }
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error rejecting review:', error);
            alert('Erro ao rejeitar review');
        } finally {
            setActioningId(null);
        }
    };

    const deleteReview = async (
        reviewId: string,
        photoUrls: string[],
        willPhotoUrls: string[]
    ) => {
        const confirmed = window.confirm("Diesen Review wirklich löschen? Das pode não ser desfeito.");
        if (!confirmed) return;

        setActioningId(reviewId);

        try {
            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photoUrls,
                    willPhotoUrls
                })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to delete review');
            }
            setReviews(prev => prev.filter(r => r.id !== reviewId));

        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Erro ao deletar avaliação');
        } finally {
            setActioningId(null);
        }
    };

    const generateNpsLink = async () => {
        const token = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const { error } = await supabase.from('nps_responses').insert({
          token,
          nickname: npsNickname.trim(),
          tour_date: npsTourDate || null,
        });

        if (error) {
            alert('Erro ao gerar token NPS');
            return;
        }
        
        const link = `${window.location.origin}/nps?token=${token}`;
        setGeneratedLink(link);
        setNpsNickname('');
        setNpsTourDate('');
        fetchNpsResponses(); // Refresh list to show the new pending token
    };

    const saveAttractions = async (reviewId: string) => {
        const attractions = editingAttractions[reviewId] || [];
        const response = await fetch(`/api/admin/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-attractions', attractions }),
        });
        if (!response.ok) { alert('Fehler beim Speichern'); return; }
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, attractions } : r));
    };

    const toggleWillPhotoConsent = async (reviewId: string, current: boolean) => {
        const next = !current;
        const { error } = await supabase
            .from('reviews')
            .update({ consent_will_photos: next })
            .eq('id', reviewId);
        if (error) { alert('Fehler beim Aktualisieren'); return; }
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, consent_will_photos: next } : r));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleAttraction = (id: string, att: string) => {
        setEditingAttractions(prev => {
            const current = prev[id] || [];
            if (current.includes(att)) {
                return { ...prev, [id]: current.filter(a => a !== att) };
            } else {
                return { ...prev, [id]: [...current, att] };
            }
        });
    };

    // --- Photo Management Functions ---

    const deletePaxPhoto = async (reviewId: string, urlToRemove: string, currentUrls: string[]) => {
        if (!confirm('Foto des Touristen wirklich löschen?')) return;
        const newUrls = currentUrls.filter(u => u !== urlToRemove);
        await supabase.from('reviews').update({ photo_urls: newUrls }).eq('id', reviewId);
        const path = urlToRemove.split('/review-photos/')[1];
        if (path) await supabase.storage.from('review-photos').remove([path]);
        fetchReviews();
    };

    const deleteWillPhoto = async (reviewId: string, urlToRemove: string, currentUrls: string[]) => {
        if (!confirm('Deine eigene Foto wirklich löschen?')) return;
        const newUrls = currentUrls.filter(u => u !== urlToRemove);
        await supabase.from('reviews').update({ will_photo_urls: newUrls }).eq('id', reviewId);
        const path = urlToRemove.split('/review-photos/')[1];
        if (path) await supabase.storage.from('review-photos').remove([path]);
        fetchReviews();
    };

    const uploadWillPhotos = async (reviewId: string, currentUrls: string[], files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(reviewId);
        const newUrls = [...currentUrls];
        for (const file of Array.from(files)) {
            const ext = file.name.split('.').pop();
            const fileName = `will-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const { data, error } = await supabase.storage.from('review-photos').upload(fileName, file, { cacheControl: '3600', upsert: false });
            if (error) continue;
            const { data: { publicUrl } } = supabase.storage.from('review-photos').getPublicUrl(data.path);
            newUrls.push(publicUrl);
        }
        await supabase.from('reviews').update({ will_photo_urls: newUrls }).eq('id', reviewId);
        setIsUploading(null);
        fetchReviews();
    };

    return (
        <div className="space-y-12 font-sans mb-12">
            
            {/* NPS Management Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Smile className="w-6 h-6 text-yellow-500" />
                        NPS Satisfaction System
                    </h2>
                    {/* Stats summary */}
                    {!loadingNps && npsResponses.length > 0 && (() => {
                        const pending = npsResponses.filter(r => !r.used_at);
                        const answered = npsResponses.filter(r => r.used_at && r.score !== null);
                        const avg = answered.length > 0
                            ? (answered.reduce((s, r) => s + (r.score ?? 0), 0) / answered.length).toFixed(1)
                            : null;
                        return (
                            <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
                                {pending.length > 0 && (
                                    <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        {pending.length} ausstehend
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                    {answered.length} beantwortet
                                </span>
                                {avg && (
                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full">
                                        Ø {avg}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </div>

                <div className="p-6 lg:p-8 flex flex-col gap-6">
                    {/* Link Generator */}
                    <div>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-yellow-500" />
                                Link generieren
                            </h3>

                            <div className="space-y-3">
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-yellow-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Name des Gastes (Nickname)"
                                        value={npsNickname}
                                        onChange={e => setNpsNickname(e.target.value)}
                                        className="w-full border border-gray-100 bg-white rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-yellow-500 transition-colors" />
                                    <input
                                        type="date"
                                        value={npsTourDate}
                                        onChange={e => setNpsTourDate(e.target.value)}
                                        className="w-full border border-gray-100 bg-white rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={generateNpsLink}
                                    disabled={!npsNickname.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 text-sm font-extrabold rounded-xl transition-all shadow-sm active:scale-95"
                                >
                                    Generieren
                                </button>
                            </div>

                            {generatedLink && (
                                <div className="mt-4 p-3 bg-white rounded-xl border border-yellow-200 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">Link bereit zum Senden:</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-gray-500 flex-1 truncate font-medium">{generatedLink}</span>
                                        <button
                                            onClick={() => copyToClipboard(generatedLink, 'generated')}
                                            className={`p-2 rounded-lg transition-all border ${copiedId === 'generated' ? 'bg-green-50 text-green-600 border-green-200' : 'text-yellow-600 hover:text-yellow-700 bg-yellow-50 border-yellow-100'}`}
                                            title="Kopieren"
                                        >
                                            {copiedId === 'generated' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Responses List — split into Pending / Answered */}
                    <div className="flex flex-col gap-6">
                        {loadingNps ? (
                            <div className="py-10 text-center flex flex-col items-center">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-200 mb-2" />
                                <p className="text-gray-400 text-xs font-bold uppercase">Laden...</p>
                            </div>
                        ) : npsResponses.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                                <p className="text-gray-400 text-xs font-bold uppercase">Keine NPS-Daten</p>
                            </div>
                        ) : (() => {
                            const pending = npsResponses.filter(r => !r.used_at);
                            const answered = npsResponses.filter(r => r.used_at);
                            return (
                                <>
                                    {/* Pending tokens */}
                                    {pending.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-extrabold text-orange-500 uppercase tracking-[2px] mb-2 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                Ausstehend ({pending.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {pending.map(r => {
                                                    const link = `${window.location.origin}/nps?token=${r.token}`;
                                                    return (
                                                        <div key={r.id} className="bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-extrabold text-gray-900 text-sm truncate">{r.nickname}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                    Erstellt: {new Date(r.created_at).toLocaleDateString('de-DE')}
                                                                    {r.tour_date && ` · Tour: ${new Date(r.tour_date).toLocaleDateString('de-DE')}`}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(link, r.id)}
                                                                className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${copiedId === r.id ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                                                            >
                                                                {copiedId === r.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                                {copiedId === r.id ? 'Kopiert' : 'Link'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Answered responses */}
                                    {answered.length > 0 && (
                                        <div>
                                            <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[2px] mb-2 flex items-center gap-1.5">
                                                <MessageSquareHeart className="w-3 h-3" />
                                                Beantwortet ({answered.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {answered.map(r => (
                                                    <div key={r.id} className="group bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-start gap-3 transition-all hover:bg-white hover:shadow-sm hover:border-gray-200">
                                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-base shrink-0
                                                            ${r.score !== null && r.score >= 9 ? 'bg-green-100 text-green-600'
                                                            : r.score !== null && r.score >= 7 ? 'bg-yellow-100 text-yellow-600'
                                                            : r.score !== null ? 'bg-red-100 text-red-600'
                                                            : 'bg-gray-100 text-gray-400'}`}>
                                                            {r.score ?? '—'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center">
                                                                <p className="font-extrabold text-gray-900 text-sm truncate">{r.nickname}</p>
                                                                {r.redirected_to_review && (
                                                                    <span className="text-[10px] text-green-600 font-black bg-green-50 px-1.5 py-0.5 rounded border border-green-100 shrink-0">
                                                                        → Review
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                {new Date(r.used_at!).toLocaleDateString('de-DE')}
                                                                {r.tour_date && ` · Tour: ${new Date(r.tour_date).toLocaleDateString('de-DE')}`}
                                                            </p>
                                                            {r.best_part && (
                                                                <p className="text-[11px] text-gray-500 italic mt-1.5 line-clamp-2">"{r.best_part}"</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Existing Reviews Moderation List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <MessageSquareHeart className="w-6 h-6 text-green-600" />
                        Reviews Moderation
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'pending' 
                            ? 'border-yellow-400 text-gray-900 bg-yellow-50/30' 
                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Ausstehend
                        {activeTab === 'pending' && reviews.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black text-[10px] rounded-full font-bold">
                                {reviews.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'approved' 
                            ? 'border-green-600 text-gray-900 bg-green-50/30' 
                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Genehmigt
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${
                            activeTab === 'rejected' 
                            ? 'border-red-600 text-gray-900 bg-red-50/30' 
                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Abgelehnt
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-medium">Wird geladen...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                                <Clock className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-gray-500 font-bold text-lg">Keine Bewertungen vorhanden.</p>
                            <p className="text-gray-400 text-sm mt-1">Hier erscheinen Einsendungen para a categoria "{activeTab}".</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div 
                                    key={review.id} 
                                    className={`border rounded-2xl p-6 md:p-8 transition-all ${
                                        actioningId === review.id ? 'opacity-50 pointer-events-none' : 'bg-white shadow-sm'
                                    } ${
                                        review.status === 'pending' ? 'border-gray-200' : 'border-gray-100 bg-gray-50/30'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                                        <div className="flex-grow">
                                            <div className="flex gap-1 mb-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star 
                                                        key={star} 
                                                        className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                                                    />
                                                ))}
                                            </div>
                                            <h3 className="font-extrabold text-gray-900 text-xl leading-tight mb-2">
                                                {review.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                <span className="bg-gray-100 px-2.5 py-0.5 rounded text-[11px] font-bold text-gray-600 uppercase">Pax ID: {review.id.slice(0, 8)}</span>
                                                <span className="font-semibold text-gray-700 underline decoration-yellow-400 underline-offset-4">Besucht: {editingAttractions[review.id]?.join(', ') || 'Keine'}</span>
                                                <span>{new Date(review.created_at).toLocaleString('de-DE')}</span>
                                            </div>
                                        </div>
                                        <div className="lg:text-right shrink-0 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50">
                                            <p className="text-sm font-extrabold text-gray-900">{review.nickname}</p>
                                            <p className="text-xs text-gray-500 font-medium">{review.email}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 relative">
                                        <MessageSquareHeart className="absolute -top-3 -right-3 w-8 h-8 text-gray-100" />
                                        <p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed italic">
                                            "{review.body}"
                                        </p>
                                    </div>

                                    {/* PHOTO MANAGEMENT (REDACTED FOR BREVITY IN TEMPLATE BUT IMPLEMENTED IN FILE) */}
                                    <div className="space-y-6 mb-8 pt-6 border-t border-gray-100">
                                        {/* Traveler Photos */}
                                        {(review.photo_urls?.length ?? 0) > 0 && (
                                            <div>
                                                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[1px] mb-3 flex items-center gap-2">
                                                    Fotos do Pax
                                                    {review.consent_own_photos
                                                        ? <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 normal-case font-bold">✓ Veröffentlichung autorisiert</span>
                                                        : <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 normal-case font-bold">✗ Keine Autorisierung</span>}
                                                </p>
                                                <div className="flex gap-3 flex-wrap">
                                                    {review.photo_urls?.map((url: string, i: number) => (
                                                        <div key={i} className="relative group overflow-hidden rounded-xl shadow-sm">
                                                            <img src={url} alt={`Foto ${i + 1}`}
                                                                className="w-24 h-24 object-cover border border-gray-100" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                                <button
                                                                    onClick={() => deletePaxPhoto(review.id, url, review.photo_urls || [])}
                                                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                                                    title="Foto löschen"><Trash2 className="w-4 h-4" /></button>
                                                                <a href={url} target="_blank" rel="noopener noreferrer"
                                                                    className="bg-white/90 hover:bg-white text-gray-900 p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform delay-75">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Will's Photos */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[1px]">
                                                    Fotos do Will
                                                </p>
                                                <button
                                                    onClick={() => toggleWillPhotoConsent(review.id, review.consent_will_photos ?? false)}
                                                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                                        review.consent_will_photos
                                                            ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                                            : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                    title="Manuelles Einverständnis umschalten"
                                                >
                                                    {review.consent_will_photos ? '✓ Autorisiert' : '✗ Nicht autorisiert'}
                                                </button>
                                            </div>
                                            <div className="flex gap-3 flex-wrap">
                                                {review.will_photo_urls?.map((url: string, i: number) => (
                                                    <div key={i} className="relative group overflow-hidden rounded-xl shadow-sm">
                                                        <img src={url} alt={`Foto Will ${i + 1}`}
                                                            className="w-24 h-24 object-cover border border-gray-100" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                            <button
                                                                onClick={() => deleteWillPhoto(review.id, url, review.will_photo_urls || [])}
                                                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                                                title="Foto löschen"><Trash2 className="w-4 h-4" /></button>
                                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                                className="bg-white/90 hover:bg-white text-gray-900 p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform delay-75">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Botão upload — só se consent_will_photos = true */}
                                                {review.consent_will_photos && (
                                                    <label className={`w-24 h-24 border-2 border-dashed ${isUploading === review.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'} rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group`}>
                                                        {isUploading === review.id ? (
                                                            <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                                                        ) : (
                                                            <>
                                                                <Plus className="w-6 h-6 text-gray-300 group-hover:text-yellow-500 transition-colors" />
                                                                <span className="text-[10px] font-bold text-gray-400 group-hover:text-yellow-500 uppercase mt-1">Upload</span>
                                                            </>
                                                        )}
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                                                            className="hidden"
                                                            disabled={!!isUploading}
                                                            onChange={(e) => uploadWillPhotos(review.id, review.will_photo_urls ?? [], e.target.files)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-gray-100">
                                        <div className="border rounded-2xl bg-white overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setShowAttractionPicker(showAttractionPicker === review.id ? null : review.id)}
                                                className="w-full flex items-center justify-between p-4 text-sm font-extrabold text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Attraktionen bearbeiten ({editingAttractions[review.id]?.length || 0} ausgewählt)
                                                {showAttractionPicker === review.id ? <ChevronUp className="w-5 h-5 text-yellow-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </button>

                                            {showAttractionPicker === review.id && (
                                                <>
                                                    <div className="p-4 border-t grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-gray-50/50">
                                                        {ATTRACTIONS.map(att => (
                                                            <label key={att} className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${editingAttractions[review.id]?.includes(att) ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingAttractions[review.id]?.includes(att)}
                                                                    onChange={() => toggleAttraction(review.id, att)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                                                                />
                                                                <span className="text-xs font-bold text-gray-700 leading-tight">{att}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    {activeTab !== 'pending' && (
                                                        <div className="p-3 border-t bg-white flex justify-end">
                                                            <button
                                                                onClick={() => saveAttractions(review.id)}
                                                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-extrabold rounded-xl transition-all shadow-sm"
                                                            >
                                                                Speichern
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {activeTab === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={!!actioningId}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-green-700/20 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        Bewertung Genehmigen
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(review.id)}
                                                        disabled={!!actioningId}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-extrabold rounded-xl transition-all shadow-sm disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                        Ablehnen
                                                    </button>
                                                </>
                                            )}
                                            
                                            <button
                                                onClick={() => deleteReview(review.id, review.photo_urls || [], review.will_photo_urls || [])}
                                                disabled={!!actioningId}
                                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-red-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                                title="Review löschen"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                Löschen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
