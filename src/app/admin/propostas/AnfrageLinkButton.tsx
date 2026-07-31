'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

const CHANNELS = [
  { von: 'whatsapp', labelKey: 'whatsapp', icon: '💬' },
  { von: 'email', labelKey: 'email', icon: '✉️' },
  { von: 'instagram', labelKey: 'instagram', icon: '📷' },
] as const;

export default function AnfrageLinkButton() {
  const t = useTranslations('admin.propostas');
  const tStatus = useTranslations('admin.status.source');
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function copyLink(von: string) {
    const url = `${window.location.origin}/anfrage?von=${von}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('copieLink'), url);
    }
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="px-4 py-2 border border-green-600 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-50 transition-colors"
      >
        {copied ? t('linkCopiado') : t('novaSolicitacao')}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          <p className="px-3 py-1.5 text-xs text-gray-400">{t('copiarLinkVia')}</p>
          {CHANNELS.map(channel => (
            <button
              key={channel.von}
              type="button"
              onClick={() => copyLink(channel.von)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <span>{channel.icon}</span>
              {tStatus(channel.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
