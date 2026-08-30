'use client';

import React, { useState } from 'react';
import { Instagram, Send, Facebook } from 'lucide-react';
import { useTranslations } from 'next-intl';

// lucide-react não tem glyphs fiéis aos logos do WhatsApp/X — SVGs de marca.
// WhatsApp: mesmo SVG usado no Footer e em proposal/ShareButtons.
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

// X (ex-Twitter): o passarinho não existe mais, é esse "X" mesmo.
const XIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

export type ShareNetwork = 'whatsapp' | 'telegram' | 'facebook' | 'x' | 'instagram';

const ALL_NETWORKS: ShareNetwork[] = ['whatsapp', 'telegram', 'facebook', 'x', 'instagram'];

interface ShareButtonsProps {
    /** URL absoluta a ser compartilhada. */
    url: string;
    /** Texto que acompanha o link nos apps que suportam (WhatsApp, Telegram, X). */
    text: string;
    /**
     * Quais redes mostrar, na ordem dada. Omitido = todas as cinco, que é o
     * comportamento de antes (bewertungen depende disso).
     */
    networks?: ShareNetwork[];
    /** `sm` reduz os botões para caber em barras de metadados. */
    size?: 'md' | 'sm';
    /**
     * `brand` = círculo na cor da rede (padrão, usado em bewertungen).
     * `plain` = só o glifo, herdando a cor do texto — para fundos escuros onde
     * cinco círculos coloridos competem com o conteúdo.
     */
    tone?: 'brand' | 'plain';
    className?: string;
}

// iOS intercepta link de facebook.com/x.com via Universal Links e entrega pro
// app nativo em vez do Safari — só que o app não sabe abrir a rota antiga de
// share (/sharer/sharer.php, /intent/tweet), então só abre o feed, sem nada
// preenchido. No desktop não tem app pra interceptar, o link direto funciona
// liso (confirmado). navigator.platform === 'MacIntel' com touch é iPadOS se
// disfarçando de Mac — Safari faz isso desde o iPad Pro com trackpad.
function isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Botões de compartilhamento social — WhatsApp, Telegram, Facebook, X e Instagram.
 *
 * WhatsApp/Telegram são links `<a target="_blank">` de verdade em todo lugar —
 * mesmo padrão já usado em proposal/ShareButtons.tsx, funcionam bem tanto no
 * desktop quanto no celular (confirmado).
 *
 * Facebook/X também são `<a>` (funcionam liso no desktop), mas no celular o
 * clique é interceptado: tenta primeiro o menu nativo de compartilhar do
 * sistema (mesmo mecanismo do Instagram, que aí sim entrega certinho pro app
 * do Facebook/X já logado) e só cai pro link direto se isso falhar.
 *
 * Instagram não tem web intent oficial: usa Web Share API nativa quando
 * disponível (mobile) e cai para "copiar link" (pra colar em Story/DM) no
 * desktop.
 */
export default function ShareButtons({ url, text, networks = ALL_NETWORKS, size = 'md', tone = 'brand', className = '' }: ShareButtonsProps) {
    const t = useTranslations('public.bewertungen');
    const [copied, setCopied] = useState(false);

    const copyLinkFallback = async () => {
        try {
            // navigator.clipboard.writeText() pode nunca resolver nem rejeitar —
            // vimos isso acontecer de verdade quando o navegador fica esperando uma
            // permissão de escrita que não vem. Sem esse timeout, o clique fica
            // pendurado pra sempre e o botão parece simplesmente não fazer nada.
            await Promise.race([
                navigator.clipboard.writeText(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('clipboard timeout')), 2000)),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // clipboard indisponível (contexto não seguro, permissão etc.) — nada
            // mais a fazer; não tem terceira alternativa aqui.
        }
    };

    // No desktop deixa o <a> navegar normal (href já é o fallback certo). No
    // celular intercepta e tenta o menu nativo primeiro; só usa o link direto
    // (fallbackUrl) se o share nativo não existir ou falhar por outro motivo
    // que não seja a pessoa cancelar.
    const handleAppShareIntercept = (fallbackUrl: string) => async (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!isMobileDevice() || typeof navigator === 'undefined' || !navigator.share) return;
        e.preventDefault();
        try {
            await navigator.share({ title: text, text, url });
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleInstagram = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: text, text, url });
                return; // compartilhou de verdade — não precisa do fallback
            } catch (err) {
                // AbortError = a própria pessoa cancelou o share sheet: silêncio é
                // o comportamento certo. Qualquer OUTRO erro (ex.: o gesto do clique
                // não foi reconhecido como "user activation" pelo browser — já vimos
                // isso acontecer) cai pro fallback de copiar link, em vez de não
                // fazer literalmente nada, que é o que causava a sensação de botão
                // quebrado.
                if (err instanceof Error && err.name === 'AbortError') return;
            }
        }
        await copyLinkFallback();
    };

    const plain = tone === 'plain';
    // No modo plain o glifo precisa ser maior: sem o círculo colorido atrás, um
    // ícone de 13px de traço fino (WhatsApp, X) simplesmente some.
    const sizeClass = plain
        ? (size === 'sm' ? 'w-5 h-5' : 'w-6 h-6')
        : (size === 'sm' ? 'w-7 h-7' : 'w-9 h-9 sm:w-10 sm:h-10');
    const glyph = plain
        ? (size === 'sm' ? 'w-[17px] h-[17px]' : 'w-5 h-5')
        : (size === 'sm' ? 'w-[13px] h-[13px]' : '');
    const buttonBase = plain
        ? `${sizeClass} flex items-center justify-center transition-colors duration-200 shrink-0`
        : `${sizeClass} flex items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-md shrink-0`;
    const bg = (brandClass: string) => (plain ? '' : brandClass);

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    const byNetwork: Record<ShareNetwork, React.ReactNode> = {
        whatsapp: (
            <a
                key="whatsapp"
                href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('shareWhatsapp')}
                title={t('shareWhatsapp')}
                className={`${buttonBase} ${bg('bg-[#25D366]')}`}
            >
                <WhatsAppIcon className={glyph || 'w-[17px] h-[17px]'} />
            </a>
        ),
        telegram: (
            <a
                key="telegram"
                href={`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('shareTelegram')}
                title={t('shareTelegram')}
                className={`${buttonBase} ${bg('bg-[#0088cc]')}`}
            >
                <Send className={glyph || 'w-[16px] h-[16px]'} />
            </a>
        ),
        facebook: (
            <a
                key="facebook"
                href={fbUrl}
                onClick={handleAppShareIntercept(fbUrl)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('shareFacebook')}
                title={t('shareFacebook')}
                className={`${buttonBase} ${bg('bg-[#1877F2]')}`}
            >
                <Facebook className={glyph || 'w-[16px] h-[16px]'} />
            </a>
        ),
        x: (
            <a
                key="x"
                href={xUrl}
                onClick={handleAppShareIntercept(xUrl)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('shareTwitter')}
                title={t('shareTwitter')}
                className={`${buttonBase} ${bg('bg-black')}`}
            >
                <XIcon className={glyph || 'w-[15px] h-[15px]'} />
            </a>
        ),
        instagram: (
            <div key="instagram" className="relative">
                <button type="button" onClick={handleInstagram} aria-label={t('shareInstagram')} title={t('shareInstagram')} className={`${buttonBase} ${bg('bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]')}`}>
                    <Instagram className={glyph || 'w-[16px] h-[16px]'} />
                </button>
                {copied && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[11px] px-2.5 py-1 rounded-full pointer-events-none">
                        {t('shareCopied')}
                    </span>
                )}
            </div>
        ),
    };

    return (
        <div className={`flex items-center justify-center flex-wrap gap-2 ${className}`}>
            {networks.map((n) => byNetwork[n])}
        </div>
    );
}
