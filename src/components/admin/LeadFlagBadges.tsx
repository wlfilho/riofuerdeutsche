'use client';

import { useTranslations } from 'next-intl';
import { leadPriorityReasons, type LeadPriorityInput } from '@/lib/leadPriority';

/**
 * Estrutural de propósito: os dois kanbans usam tipos de lead diferentes
 * (`Lead` em /admin/leads, `CrmLead` em /admin/crm) e os dois têm estes campos,
 * porque os dois vêm de `price_leads`.
 */
type FlaggableLead = LeadPriorityInput & { confirmation_error?: string | null };

/**
 * Os dois avisos que mudam a ordem de trabalho do Will:
 *
 *  ⭐ prioridade — grupo grande, roteiro longo ou Carnaval. Derivado do próprio
 *     lead, nunca gravado (ver src/lib/leadPriority.ts).
 *  ⚠️ confirmação falhou — o e-mail automático não saiu. Precisa ser VISÍVEL,
 *     senão o Will assume que a pessoa foi avisada e ela ficou no escuro, que é
 *     exatamente o problema que a confirmação existe para resolver.
 *
 * "Enviada com sucesso" não vira badge de propósito: é o caso normal, e um selo
 * verde em todo lead esconderia o vermelho. Isso aparece só na ficha do lead.
 */
export default function LeadFlagBadges({ lead, className = '' }: { lead: FlaggableLead; className?: string }) {
  const t = useTranslations('admin.crm');
  const reasons = leadPriorityReasons(lead);
  const failed = Boolean(lead.confirmation_error);

  if (reasons.length === 0 && !failed) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {reasons.length > 0 && (
        <span
          className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800"
          title={reasons.map(r => t(`prioridadeMotivo.${r}`)).join(' · ')}
        >
          ⭐ {t('prioridade')}
        </span>
      )}
      {failed && (
        <span
          className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-800"
          title={lead.confirmation_error ?? undefined}
        >
          ⚠️ {t('confirmacaoFalhou')}
        </span>
      )}
    </span>
  );
}
