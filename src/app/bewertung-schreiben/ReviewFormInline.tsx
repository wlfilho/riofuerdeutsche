'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { uploadReviewPhoto } from '@/lib/uploadReviewPhoto';
import { Star, Loader2 } from 'lucide-react';

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
    website: string;
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

interface ReviewFormInlineProps {
    nickname: string;
    onSuccess: () => void;
}

export default function ReviewFormInline({ nickname, onSuccess }: ReviewFormInlineProps) {
    const t = useTranslations('public.bewertungen.form');
    const [formData, setFormData] = useState<FormData>({
        attractions: [],
        nickname: nickname,
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (photoFiles.length + files.length > 5) {
            setErrors(prev => ({ ...prev, photos: t('errorTooManyPhotos') }));
            return;
        }
        const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            setErrors(prev => ({ ...prev, photos: t('errorPhotoTooLarge') }));
            return;
        }
        setErrors(prev => { const e = { ...prev }; delete e.photos; return e; });
        setPhotoFiles(prev => [...prev, ...files]);
    };

    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.nickname.trim()) newErrors.nickname = t('errorNickname');
        if (!formData.email.trim()) {
            newErrors.email = t('errorEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('errorEmailInvalid');
        }
        if (formData.rating === 0) newErrors.rating = t('errorRating');
        if (!formData.title.trim()) newErrors.title = t('errorTitle');
        if (formData.body.trim().length < 50) {
            newErrors.body = t('errorBodyTooShort', { count: String(formData.body.trim().length) });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setErrors({});

        if (formData.website) {
            onSuccess();
            return;
        }

        if (!validate()) return;

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            const uploadedUrls: string[] = [];
            for (const file of photoFiles) {
                try {
                    uploadedUrls.push(await uploadReviewPhoto(file));
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                }
            }

            const { error } = await supabase.from('reviews').insert({
                attractions: formData.attractions,
                nickname: formData.nickname,
                email: formData.email,
                rating: formData.rating,
                title: formData.title,
                body: formData.body,
                photo_urls: uploadedUrls,
                consent_own_photos: formData.consentOwnPhotos,
                consent_will_photos: formData.consentWillPhotos,
                status: 'pending',
            });

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Submit error:', error);
            setErrors({ submit: t('errorSubmit') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 p-6 md:p-10">

            {/* Honeypot */}
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

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                        {t('nicknameLabel')}
                    </label>
                    <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        className={`w-full px-4 py-2.5 bg-white border ${errors.nickname ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all`}
                    />
                    {errors.nickname && <p className="text-xs text-red-500">{errors.nickname}</p>}
                </div>
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                        {t('emailLabel')} <span className="text-xs font-normal text-gray-400">{t('emailNote')}</span>
                    </label>
                    <input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('ratingLabel')}
                </label>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-0.5"
                        >
                            <Star className={`w-9 h-9 transition-colors ${(hoveredRating || formData.rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        </button>
                    ))}
                </div>
                {errors.rating && <p className="text-xs text-red-500">{errors.rating}</p>}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('titleLabel')}
                </label>
                <input
                    type="text"
                    placeholder={t('titlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none transition-all`}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Body */}
            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('bodyLabel')}
                </label>
                <textarea
                    rows={6}
                    placeholder={t('bodyPlaceholder')}
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white border ${errors.body ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none transition-all resize-y min-h-[120px]`}
                />
                <div className="flex justify-between items-start">
                    {errors.body
                        ? <p className="text-xs text-red-500">{errors.body}</p>
                        : <p className="text-xs text-gray-400">{t('bodyMinHint')}</p>}
                    <p className={`text-xs tabular-nums ${formData.body.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                        {t('bodyCharCount', { count: String(formData.body.length) })}
                    </p>
                </div>
            </div>

            {/* Photo upload */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                    {t('photosLabel')} <span className="text-gray-400 font-normal">{t('photosOptional')}</span>
                </label>
                <p className="text-xs text-gray-400">
                    {t('photosHint')}
                </p>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-800 hover:file:bg-yellow-100 cursor-pointer"
                />
                {photoFiles.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {photoFiles.map((file, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={t('photoAlt', { n: String(index + 1) })}
                                    className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {errors.photos && <p className="text-red-500 text-xs">{errors.photos}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Attractions */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        {t('attractionsLabel')}
                    </label>
                    <p className="text-xs text-gray-400 italic">{t('attractionsHint')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ATTRACTIONS.map((item) => (
                        <label
                            key={item}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                formData.attractions.includes(item)
                                    ? 'bg-yellow-50 border-yellow-400 text-gray-900'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="checkbox"
                                value={item}
                                checked={formData.attractions.includes(item)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFormData(prev => ({ ...prev, attractions: [...prev.attractions, item] }));
                                    } else {
                                        setFormData(prev => ({ ...prev, attractions: prev.attractions.filter(a => a !== item) }));
                                    }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                            />
                            <span className="text-xs font-medium leading-tight">{item}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Foto consent */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50 space-y-4">
                <p className="text-sm font-bold text-gray-700">{t('consentTitle')}</p>
                <div className="space-y-3">
                    {photoFiles.length > 0 && (
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.consentOwnPhotos}
                                onChange={(e) => setFormData(prev => ({ ...prev, consentOwnPhotos: e.target.checked }))}
                                className="mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                {t('consentOwnPhotos')}
                            </span>
                        </label>
                    )}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.consentWillPhotos}
                            onChange={(e) => setFormData(prev => ({ ...prev, consentWillPhotos: e.target.checked }))}
                            className="mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {t('consentWillPhotos')}
                        </span>
                    </label>
                </div>
            </div>

            {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {errors.submit}
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-black font-bold py-4 px-6 rounded-2xl transition-all shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />{t('submitting')}</>
                ) : (
                    t('submit')
                )}
            </button>
        </div>
    );
}
