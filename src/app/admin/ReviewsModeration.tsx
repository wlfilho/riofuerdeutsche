'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Star, CheckCircle, XCircle, Clock, MessageSquare, 
    ChevronDown, ChevronUp, ExternalLink, Trash2, Plus, Loader2 
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

export default function ReviewsModeration() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [editingAttractions, setEditingAttractions] = useState<Record<string, string[]>>({});
    const [showAttractionPicker, setShowAttractionPicker] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('id, created_at, nickname, email, rating, title, body, status, attractions, photo_urls, will_photo_urls, consent_own_photos, consent_will_photos')
            .eq('status', activeTab)
            .order(activeTab === 'approved' ? 'approved_at' : 'created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data || []);
            const initialMap: Record<string, string[]> = {};
            (data || []).forEach(r => {
                initialMap[r.id] = r.attractions || [];
            });
            setEditingAttractions(initialMap);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [activeTab]);

    const handleApprove = async (id: string) => {
        setActioningId(id);
        const finalAttractions = editingAttractions[id] || [];

        const { error } = await supabase
            .from('reviews')
            .update({ 
                status: 'approved', 
                approved_at: new Date().toISOString(),
                attractions: finalAttractions
            })
            .eq('id', id);

        if (error) {
            alert('Erro ao aprovar review');
        } else {
            setReviews(reviews.filter(r => r.id !== id));
        }
        setActioningId(null);
    };

    const handleReject = async (id: string) => {
        if (!confirm('Deseja realmente rejeitar esta avaliação?')) return;
        
        setActioningId(id);
        const { error } = await supabase
            .from('reviews')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) {
            alert('Erro ao rejeitar review');
        } else {
            setReviews(reviews.filter(r => r.id !== id));
        }
        setActioningId(null);
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
        const { error: dbError } = await supabase.from('reviews').update({ photo_urls: newUrls }).eq('id', reviewId);
        
        if (dbError) {
            alert('Erro ao remover do banco de dados');
            return;
        }

        const path = urlToRemove.split('/review-photos/')[1];
        if (path) {
            await supabase.storage.from('review-photos').remove([path]);
        }
        
        fetchReviews();
    };

    const deleteWillPhoto = async (reviewId: string, urlToRemove: string, currentUrls: string[]) => {
        if (!confirm('Deine eigene Foto wirklich löschen?')) return;

        const newUrls = currentUrls.filter(u => u !== urlToRemove);
        const { error: dbError } = await supabase.from('reviews').update({ will_photo_urls: newUrls }).eq('id', reviewId);
        
        if (dbError) {
            alert('Erro ao remover do banco de dados');
            return;
        }

        const path = urlToRemove.split('/review-photos/')[1];
        if (path) {
            await supabase.storage.from('review-photos').remove([path]);
        }
        
        fetchReviews();
    };

    const uploadWillPhotos = async (reviewId: string, currentUrls: string[], files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(reviewId);
        const newUrls = [...currentUrls];

        for (const file of Array.from(files)) {
            const ext = file.name.split('.').pop();
            const fileName = `will-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            
            const { data, error } = await supabase.storage
                .from('review-photos')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });
            
            if (error) { 
                console.error('Upload fail:', error); 
                continue; 
            }
            
            const { data: { publicUrl } } = supabase.storage.from('review-photos').getPublicUrl(data.path);
            newUrls.push(publicUrl);
        }

        const { error: dbError } = await supabase.from('reviews').update({ will_photo_urls: newUrls }).eq('id', reviewId);
        
        if (dbError) {
            alert('Erro ao salvar URLs no banco de dados');
        }
        
        setIsUploading(null);
        fetchReviews();
    };

    return (
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm font-sans">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Bewertungen Moderation
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
                        <p className="text-gray-400 text-sm mt-1">Hier erscheinen Einsendungen für die Kategorie "{activeTab}".</p>
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
                                    <MessageSquare className="absolute -top-3 -right-3 w-8 h-8 text-gray-100" />
                                    <p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed italic">
                                        "{review.body}"
                                    </p>
                                </div>

                                {/* GESTÃO DE FOTOS */}
                                <div className="space-y-6 mb-8 pt-6 border-t border-gray-100">
                                    {/* Fotos do pax */}
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

                                    {/* Fotos do Will */}
                                    <div>
                                        <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[1px] mb-3 flex items-center gap-2">
                                            Fotos do Will
                                            {review.consent_will_photos
                                                ? <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 normal-case font-bold">✓ Veröffentlichung autorisiert</span>
                                                : <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 normal-case font-bold">✗ Keine Autorisierung vom Pax</span>}
                                        </p>
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

                                {activeTab === 'pending' && (
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
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
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
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-red-700/20 disabled:opacity-50"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Ablehnen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
