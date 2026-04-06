'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star, CheckCircle, XCircle, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

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
}

export default function ReviewsModeration() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [editingAttractions, setEditingAttractions] = useState<Record<string, string[]>>({});
    const [showAttractionPicker, setShowAttractionPicker] = useState<string | null>(null);

    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        let query = supabase
            .from('reviews')
            .select('*');

        if (activeTab === 'pending') {
            query = query.eq('status', 'pending').order('created_at', { ascending: false });
        } else if (activeTab === 'approved') {
            query = query.eq('status', 'approved').order('approved_at', { ascending: false });
        } else {
            query = query.eq('status', 'rejected').order('created_at', { ascending: false });
        }

        const { data, error } = await query;
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

    return (
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Bewertungen Moderation
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === 'pending' 
                        ? 'border-yellow-400 text-gray-900 bg-yellow-50/30' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
                    className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === 'approved' 
                        ? 'border-green-600 text-gray-900 bg-green-50/30' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Genehmigt
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === 'rejected' 
                        ? 'border-red-600 text-gray-900 bg-red-50/30' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    Abgelehnt
                </button>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="py-12 text-center text-gray-400 animate-pulse">
                        Wird geladen...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Keine Bewertungen in dieser Kategorie.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div 
                                key={review.id} 
                                className={`border rounded-xl p-5 md:p-6 transition-all ${
                                    actioningId === review.id ? 'opacity-50 pointer-events-none' : 'bg-white'
                                } ${
                                    review.status === 'pending' ? 'border-gray-200' : 'border-gray-100 bg-gray-50/30'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                                                />
                                            ))}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                            {review.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                                            <span className="font-medium text-gray-700">Besucht: {editingAttractions[review.id]?.join(', ') || 'Keine'}</span>
                                            <span>•</span>
                                            <span>{new Date(review.created_at).toLocaleDateString('de-DE')}</span>
                                        </div>
                                    </div>
                                    <div className="md:text-right">
                                        <p className="text-sm font-bold text-gray-800">{review.nickname}</p>
                                        <p className="text-xs text-gray-400">{review.email}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-lg p-4 mb-6 border border-gray-100">
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed italic">
                                        "{review.body}"
                                    </p>
                                </div>

                                {activeTab === 'pending' && (
                                    <div className="space-y-4">
                                        <div className="border rounded-xl bg-white overflow-hidden">
                                          <button 
                                            onClick={() => setShowAttractionPicker(showAttractionPicker === review.id ? null : review.id)}
                                            className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                          >
                                            Attraktionen bearbeiten ({editingAttractions[review.id]?.length || 0})
                                            {showAttractionPicker === review.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                          </button>
                                          
                                          {showAttractionPicker === review.id && (
                                            <div className="p-3 border-t grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50">
                                              {ATTRACTIONS.map(att => (
                                                <label key={att} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded transition-colors">
                                                  <input 
                                                    type="checkbox" 
                                                    checked={editingAttractions[review.id]?.includes(att)}
                                                    onChange={() => toggleAttraction(review.id, att)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                  />
                                                  <span className="text-[10px] md:text-xs text-gray-600 leading-tight">{att}</span>
                                                </label>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleApprove(review.id)}
                                                disabled={!!actioningId}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Genehmigen
                                            </button>
                                            <button
                                                onClick={() => handleReject(review.id)}
                                                disabled={!!actioningId}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
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
