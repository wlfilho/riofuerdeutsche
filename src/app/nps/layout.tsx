import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wie war deine Tour? – Feedback für Will',
    description: 'Teile dein Feedback zu deiner Tour mit Will in Rio de Janeiro. 3 kurze Fragen, weniger als eine Minute.',
    openGraph: {
        title: 'Wie war deine Tour mit Will?',
        description: 'Teile dein Feedback zu deiner Tour in Rio de Janeiro.',
        images: [
            {
                url: '/images/og_bewertung.webp',
                width: 1200,
                height: 630,
                alt: 'Feedback – Rio für Deutsche',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wie war deine Tour mit Will?',
        description: 'Teile dein Feedback zu deiner Tour in Rio de Janeiro.',
        images: ['/images/og_bewertung.webp'],
    },
};

export default function NpsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
