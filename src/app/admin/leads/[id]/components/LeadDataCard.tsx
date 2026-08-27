'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import SourceBadge from '../../components/SourceBadge';
import GroupBadges from '@/components/admin/GroupBadges';
import { fmtDate, fmtEur } from '@/lib/adminFormat';
import type { LeadGroup } from '@/lib/leadGroups';
import type { Lead } from '../../page';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="w-28 shrink-0 text-xs font-medium text-gray-400 pt-0.5">{label}</span>
      <div className="flex-1 text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function LeadDataCard({ lead }: { lead: Lead & { groups: LeadGroup[] } }) {
  const [claudeUrl, setClaudeUrl] = useState(lead.claude_chat_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const t = useTranslations('admin.crm');
  const tCommon = useTranslations('admin.common');

  const handleSaveClaudeUrl = async () => {
    setSaving(true);
    await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claude_chat_url: claudeUrl.trim() || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const waText = encodeURIComponent(
    `Hallo ${lead.name}, vielen Dank für Ihre Anfrage bei Rio für Deutsche!`
  );
  const waUrl = lead.phone
    ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${waText}`
    : null;
  const mailUrl = `mailto:${lead.email}?subject=Ihre%20Anfrage%20%E2%80%93%20Rio%20f%C3%BCr%20Deutsche`;
  const canConvert = lead.status !== 'closed' && lead.status !== 'lost';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">{t('dadosDoLead')}</h2>
        {canConvert && (
          <Link
            href={`/admin/propostas/nova?lead_id=${lead.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            {t('converterEmProposta')}
          </Link>
        )}
      </div>

      {/* Rows */}
      <div className="px-5 py-1">
        <Row label={tCommon('nome')}>{lead.name}</Row>

        <Row label={tCommon('email')}>
          <div className="flex items-center gap-2 flex-wrap">
            <span>{lead.email}</span>
            <a
              href={mailUrl}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {t('enviarEmail')}
            </a>
          </div>
        </Row>

        <Row label={tCommon('whatsapp')}>
          {lead.phone ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span>{lead.phone}</span>
              <a
                href={waUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('abrirWhatsapp')}
              </a>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">{t('naoInformado')}</span>
          )}
        </Row>

        <Row label={tCommon('pax')}>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
            </svg>
            {tCommon('pessoasCount', { count: lead.pax })}
          </span>
        </Row>

        {lead.days !== null && (
          <Row label={tCommon('diasLabel')}>{tCommon('diasCount', { count: lead.days })}</Row>
        )}

        <Row label={tCommon('origem')}>
          <div className="flex flex-wrap items-center gap-1.5">
            <SourceBadge source={lead.source} />
            {/* Chegada e submissão são coisas diferentes: 'Formulário · via
                whatsapp' quer dizer que a pessoa veio do WhatsApp e preencheu
                a Anfrage. Ver o bloco em src/app/api/anfrage/route.ts. */}
            {lead.arrival_channel && (
              <span className="text-xs text-gray-500">
                {t('viaCanal', { canal: lead.arrival_channel })}
              </span>
            )}
          </div>
        </Row>

        {lead.tour_slug && (
          <Row label={t('paginaDeTour')}>
            <Link
              href={`/touren/${lead.tour_slug}`}
              target="_blank"
              className="text-green-700 hover:underline"
            >
              /touren/{lead.tour_slug}
            </Link>
          </Row>
        )}

        {lead.groups.length > 0 && (
          <Row label={t('grupos')}>
            <GroupBadges groups={lead.groups} />
          </Row>
        )}

        <Row label={t('criadoEm')}>{fmtDate(lead.created_at)}</Row>

        {(lead.estimated_min !== null || lead.estimated_max !== null) && (
          <Row label={t('colEstimativa')}>
            {lead.estimated_min !== null && lead.estimated_max !== null
              ? t('estimativaEntre', {
                  min: fmtEur(lead.estimated_min),
                  max: fmtEur(lead.estimated_max),
                })
              : fmtEur(lead.estimated_min ?? lead.estimated_max)}
          </Row>
        )}

        <Row label={t('conversaClaude')}>
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://claude.ai/chat/..."
              value={claudeUrl || ''}
              onChange={(e) => setClaudeUrl(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={handleSaveClaudeUrl}
              disabled={saving}
              className="shrink-0 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saved ? tCommon('salvoCheck') : saving ? '...' : tCommon('salvar')}
            </button>
            {claudeUrl && (
              <a
                href={claudeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                {t('abrir')}
              </a>
            )}
          </div>
        </Row>
      </div>
    </div>
  );
}
