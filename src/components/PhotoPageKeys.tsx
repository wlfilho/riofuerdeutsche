'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PhotoPageKeysProps {
    prevHref?: string;
    nextHref?: string;
    backHref: string;
}

/**
 * Atalhos de teclado da página de foto (← → Esc) — a página em si é um
 * Server Component, então essa navegação isolada em um client component
 * pequeno é só progressive enhancement por cima dos links normais.
 */
export default function PhotoPageKeys({ prevHref, nextHref, backHref }: PhotoPageKeysProps) {
    const router = useRouter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') router.push(backHref);
            else if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref);
            else if (e.key === 'ArrowRight' && nextHref) router.push(nextHref);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [router, prevHref, nextHref, backHref]);

    return null;
}
