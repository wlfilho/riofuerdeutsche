import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('public.nps');
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            images: [
                {
                    url: '/images/og_bewertung.webp',
                    width: 1200,
                    height: 630,
                    alt: t('ogImageAlt'),
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('ogTitle'),
            description: t('ogDescription'),
            images: ['/images/og_bewertung.webp'],
        },
    };
}

export default function NpsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
