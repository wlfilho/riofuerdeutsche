'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Compartilhamento do Angebot pelo próprio cliente com os parceiros de
// viagem: WhatsApp, Telegram, e-mail, copiar link e — quando o aparelho
// suporta — o share nativo do sistema. Só o link, sem texto pré-pronto:
// a pessoa escreve com as próprias palavras.
export default function ShareButtons({ url }: { url: string }) {
  const t = useTranslations('public.angebot.share');
  const [toastVisible, setToastVisible] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setToastVisible(true);
    timer.current = setTimeout(() => setToastVisible(false), 1800);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: t('nativeShareTitle'), url });
    } catch {
      // usuário cancelou o share sheet — nada a fazer
    }
  };

  const btnCls =
    'inline-flex items-center justify-center w-11 h-11 rounded-full text-white shadow-sm hover:opacity-85 transition-opacity';

  return (
    <div className="text-center">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
        {t('title')}
      </p>
      <div className="flex items-center justify-center gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-track-click="share_whatsapp"
          title={t('whatsapp')}
          aria-label={t('whatsapp')}
          className={`${btnCls} bg-[#25D366]`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>

        {/* Telegram — telegram.me em vez de t.me: alguns provedores (BR
            inclusive) ainda bloqueiam o DNS de t.me; o domínio completo resolve. */}
        <a
          href={`https://telegram.me/share/url?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-track-click="share_telegram"
          title={t('telegram')}
          aria-label={t('telegram')}
          className={`${btnCls} bg-[#229ED9]`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </a>

        {/* E-Mail */}
        <a
          href={`mailto:?subject=${encodeURIComponent(t('emailSubject'))}&body=${encodeURIComponent(url)}`}
          data-track-click="share_email"
          title={t('email')}
          aria-label={t('email')}
          className={`${btnCls} bg-gray-500`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </a>

        {/* Link kopieren */}
        <button
          onClick={handleCopy}
          data-track-click="share_copy"
          title={t('copyLink')}
          aria-label={t('copyLink')}
          className={`${btnCls} bg-gray-700`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>

        {/* Share nativo (só quando o aparelho suporta) */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            data-track-click="share_native"
            title={t('native')}
            aria-label={t('native')}
            className={`${btnCls} bg-green-600`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
            </svg>
          </button>
        )}
      </div>

      {/* Toast */}
      <span
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900/95 text-white text-sm font-medium shadow-xl backdrop-blur-sm transition-all duration-300 ease-out ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {t('copied')}
      </span>
    </div>
  );
}
