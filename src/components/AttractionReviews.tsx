import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import FadeIn from './FadeIn';
import ReviewCard, { Review } from './ReviewCard';

interface AttractionReviewsProps {
    /** Valor exato como salvo em reviews.attractions — ver a lista ATTRACTIONS
        em bewertung-schreiben/ReviewFormInline.tsx. */
    attraction: string;
    /** Título da seção, já com o artigo certo ("über den Zuckerhut" etc.). */
    title: string;
}

/** Seção de avaliações filtrada por ponto turístico, usada nas páginas de
    Sehenswürdigkeiten do Rio-Guide. Só aparecem reviews aprovadas que marcaram
    o lugar no formulário; sem nenhuma, a seção não é renderizada. */
export default async function AttractionReviews({ attraction, title }: AttractionReviewsProps) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('reviews')
        .select('id, created_at, nickname, rating, title, body, attractions, photo_urls, will_photo_urls, consent_own_photos, consent_will_photos')
        .eq('status', 'approved')
        .contains('attractions', [attraction])
        .order('approved_at', { ascending: false })
        .limit(6);

    const reviews: Review[] = data ?? [];
    if (reviews.length === 0) return null;

    // Na coluna de 800px cabem no máximo 2 cards lado a lado; com 1 review o
    // card ocupa a coluna inteira.
    const gridClass =
        reviews.length === 1
            ? 'grid gap-8'
            : 'grid gap-8 items-stretch md:grid-cols-2';

    // bg-rio-sand/30 é a mesma cor da seção de Bewertungen da home — e uma
    // terceira cor de propósito: a seção fica entre uma seção branca e o
    // "Passt gut dazu…" cinza, e como ela só aparece quando o lugar tem review
    // aprovada, branco ou cinza aqui criaria duas seções vizinhas da mesma cor
    // em algum dos dois estados.
    return (
        <section className="py-20 lg:py-24 bg-rio-sand/30 border-t border-gray-100" aria-label={title}>
            <div className="max-w-7xl mx-auto px-5 lg:px-8">
                {/* Mesma coluna de 800px dos textos, do Insider-Tipp e do FAQ
                    destas páginas — a seção acompanha a largura do conteúdo. */}
                <div className="max-w-[800px] mx-auto">
                    {/* O título da seção é o <h2>, não o kicker: "Erfahrungen" é
                        rótulo genérico e a frase de baixo é a que nomeia o ponto
                        turístico. Trocar as tags não muda nada na tela (as classes
                        seguem cada uma com o seu texto), só põe a frase certa no
                        sumário de headings que o Google e o leitor de tela leem. */}
                    <FadeIn direction="up" className="mb-10">
                        <p className="text-xs font-bold tracking-widest uppercase text-rio-green mb-3">
                            Erfahrungen
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 leading-tight">
                            {title}
                        </h2>
                    </FadeIn>

                    <div className={gridClass}>
                        {reviews.map((review, i) => (
                            <FadeIn key={review.id} delay={i * 0.1} direction="up" className="h-full">
                                <ReviewCard review={review} layout="compact" />
                            </FadeIn>
                        ))}
                    </div>

                    {/* Mesmo botão da seção de Bewertungen da home. */}
                    <FadeIn direction="up" className="text-center mt-10">
                        <Link
                            href="/bewertungen"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rio-green text-rio-green rounded-full font-bold text-base hover:bg-rio-green/5 transition-all group"
                        >
                            Alle Bewertungen lesen
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
