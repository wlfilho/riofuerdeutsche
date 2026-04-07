'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

interface FormData {
    attractions: string[];
    nickname: string;
    email: string;
    rating: number;
    title: string;
    body: string;
    website: string; // Honeypot field
    consentOwnPhotos: boolean;
    consentWillPhotos: boolean;
}

interface FormErrors {
    attractions?: string;
    nickname?: string;
    email?: string;
    rating?: string;
    title?: string;
    body?: string;
    photos?: string;
    submit?: string;
}

export default function ReviewForm() {
    const [formData, setFormData] = useState<FormData>({
        attractions: [],
        nickname: '',
        email: '',
        rating: 0,
        title: '',
        body: '',
        website: '',
        consentOwnPhotos: false,
        consentWillPhotos: false,
    });

    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mountTime, setMountTime] = useState(0);

    useEffect(() => {
        setMountTime(Date.now());
    }, []);

    // Handler para selecionar fotos
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Máximo 5 fotos
        if (photoFiles.length + files.length > 5) {
            setErrors(prev => ({ ...prev, photos: "Maximal 5 Fotos erlaubt." }));
            return;
        }
        
        // Máximo 5MB por ficheiro
        const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            setErrors(prev => ({ ...prev, photos: "Jedes Bild darf maximal 5 MB groß sein." }));
            return;
        }
        
        setErrors(prev => {
            const newErrs = { ...prev };
            delete newErrs.photos;
            return newErrs;
        });
        setPhotoFiles(prev => [...prev, ...files]);
    };

    // Remover foto do preview
    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.nickname.trim()) newErrors.nickname = 'Bitte gib deinen Namen an.';
        if (!formData.email.trim()) {
            newErrors.email = 'Bitte gib deine E-Mail-Adresse an.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Bitte gib uma válida E-Mail-Adresse an.';
        }
        if (formData.rating === 0) newErrors.rating = 'Bitte gib uma avaliação b.';
        if (!formData.title.trim()) newErrors.title = 'Bitte gib um título an.';
        if (formData.body.trim().length < 50) {
            newErrors.body = `Deine Erfahrung muss mindestens 50 Zeichen lang sein (aktuell: ${formData.body.trim().length}).`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // 1. Honeypot check
        if (formData.website) {
            console.log('Spam detectado (honeypot)');
            setIsSubmitted(true);
            return;
        }

        // 2. Time check
        const timeElapsed = Date.now() - mountTime;
        if (timeElapsed < 3000) {
            console.log('Spam detectado (velocidade)');
            setIsSubmitted(true);
            return;
        }

        if (!validate()) return;

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // 2. Upload de fotos (se houver)
            const uploadedUrls: string[] = [];
            
            for (const file of photoFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('review-photos')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue; // continua mesmo se 1 foto falhar
                }
                
                // Obter URL pública
                const { data: { publicUrl } } = supabase.storage
                    .from('review-photos')
                    .getPublicUrl(uploadData.path);
                
                uploadedUrls.push(publicUrl);
            }

            // 3. Insert no Supabase
            const { error } = await supabase
                .from('reviews')
                .insert({
                    attractions: formData.attractions,
                    nickname: formData.nickname,
                    email: formData.email,
                    rating: formData.rating,
                    title: formData.title,
                    body: formData.body,
                    photo_urls: uploadedUrls,
                    consent_own_photos: formData.consentOwnPhotos,
                    consent_will_photos: formData.consentWillPhotos,
                    status: 'pending'
                });

            if (error) throw error;
            setIsSubmitted(true);

        } catch (error) {
            console.error('Submit error:', error);
            setErrors({ submit: 'Ups! Etwas ist schief gelaufen. Bitte versuche es später noch einmal.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center transition-all duration-500">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Vielen Dank für deine Bewertung!
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Wir prüfen deine Bewertung und schalten sie in Kürze frei.
                        Als Dankeschön erhältst du bald eine E-Mail von uns.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück zur Startseite
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Deine Erfahrung teilen
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto">
                        Hat dir das Erlebnis gefallen? Schreib uns — dein Feedback hilft anderen deutschen Reisenden.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        
                        {/* Honeypot field (hidden from humans) */}
                        <div className="hidden" aria-hidden="true">
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        {/* Name & Email Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label htmlFor="nickname" className="block text-sm font-semibold text-gray-700">
                                    Dein Name / Nickname
                                </label>
                                <input
                                    type="text"
                                    id="nickname"
                                    placeholder="z.B. Max Mustermann"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-white border ${errors.nickname ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.nickname && (
                                    <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Deine E-Mail <span className="text-xs font-normal text-gray-500">(wird nicht veröffentlicht)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="email@beispiel.de"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">
                                Wie bewertest du deine Erfahrung?
                            </label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-115 active:scale-95 p-0.5"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-colors ${
                                                (hoveredRating || formData.rating) >= star
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {errors.rating && (
                                <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                                Titel deiner Bewertung
                            </label>
                            <input
                                type="text"
                                id="title"
                                placeholder="Fasse deine Erfahrung kurz zusammen"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full px-4 py-2.5 bg-white border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none transition-all`}
                            />
                            {errors.title && (
                                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Body */}
                        <div className="space-y-1.5">
                            <label htmlFor="body" className="block text-sm font-semibold text-gray-700">
                                Deine Erfahrung
                            </label>
                            <textarea
                                id="body"
                                rows={6}
                                placeholder="Erzähl uns von deinem Tag. Was hat dir besonders gut gefallen?"
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                className={`w-full px-4 py-2.5 bg-white border ${errors.body ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none transition-all resize-y min-h-[120px]`}
                            ></textarea>
                            <div className="flex justify-between items-start">
                                {errors.body ? (
                                    <p className="text-xs text-red-500 mt-1">{errors.body}</p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Min. 50 Zeichen</p>
                                )}
                                <p className={`text-xs mt-1 tabular-nums ${formData.body.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {formData.body.length} Zeichen
                                </p>
                            </div>
                        </div>

                        {/* Upload de fotos */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Fotos teilen <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Hast du Fotos von der Tour? Du kannst bis zu 5 Bilder hochladen. 
                                (JPG, PNG · max. 5 MB pro Bild)
                            </p>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handlePhotoChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-medium
                                file:bg-yellow-50 file:text-yellow-800
                                hover:file:bg-yellow-100 cursor-pointer"
                            />

                            {/* Preview das fotos selecionadas */}
                            {photoFiles.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {photoFiles.map((file, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Foto ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white 
                                                rounded-full w-5 h-5 flex items-center justify-center 
                                                text-xs hover:bg-red-600 shadow-sm"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.photos && (
                                <p className="text-red-500 text-xs mt-1">{errors.photos}</p>
                            )}
                        </div>

                        <hr className="border-gray-100" />

                        {/* Attractions visited (Optional) */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Was hast du mit Will besucht?
                                </label>
                                <p className="text-xs text-gray-500 mb-4 italic">(Optional — hilft anderen Reisenden zu wissen, was du gesehen hast)</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {ATTRACTIONS.map((item) => (
                                    <label
                                        key={item}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            formData.attractions.includes(item)
                                                ? 'bg-yellow-50 border-yellow-400 text-gray-900'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={item}
                                            checked={formData.attractions.includes(item)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        attractions: [...prev.attractions, item]
                                                    }))
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        attractions: prev.attractions.filter(a => a !== item)
                                                    }))
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <span className="text-xs font-medium leading-tight">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Consentimento de fotos */}
                        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
                            <p className="text-sm font-bold text-gray-700">Foto-Einwilligung</p>

                            <div className="space-y-3">
                                {/* Consentimento para fotos do próprio upload */}
                                {photoFiles.length > 0 && (
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.consentOwnPhotos}
                                            onChange={(e) =>
                                                setFormData(prev => ({ ...prev, consentOwnPhotos: e.target.checked }))
                                            }
                                            className="mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                            Ich bin einverstanden, dass die hochgeladenen Fotos auf der Website 
                                            und in den sozialen Medien von Rio für Deutsche veröffentlicht werden dürfen.
                                        </span>
                                    </label>
                                )}

                                {/* Consentimento para fotos tiradas pelo Will */}
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.consentWillPhotos}
                                        onChange={(e) =>
                                            setFormData(prev => ({ ...prev, consentWillPhotos: e.target.checked }))
                                        }
                                        className="mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        Ich bin einverstanden, dass Fotos, die Will während der Tour von mir 
                                        gemacht hat, auf der Website und in den sozialen Medien von 
                                        Rio für Deutsche veröffentlicht werden dürfen.
                                    </span>
                                </label>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-black font-bold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Wird gesendet...
                                </>
                            ) : (
                                <>
                                    Bewertung absenden
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto mt-12 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Rio für Deutsche — Deine Experten in Rio de Janeiro
            </div>
        </div>
    );
}
