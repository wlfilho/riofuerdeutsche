import { getAdminTranslations } from '@/i18n/admin';
import { getCampaign, parseCampaignData, PHONE_COUNTRY_LABELS } from '@/lib/campaigns';
import { fmtDateTime } from '@/lib/adminFormat';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="w-32 shrink-0 text-xs font-medium text-gray-400 pt-0.5">{label}</span>
      <div className="flex-1 text-sm text-gray-800">{children}</div>
    </div>
  );
}

/** Respostas do formulário de campanha. Não renderiza nada fora de campanha. */
export default async function LeadCampaignCard({
  campaign: slug,
  campaignData,
}: {
  campaign: string | null;
  campaignData: unknown;
}) {
  const campaign = getCampaign(slug);
  if (!campaign) return null;

  const t = await getAdminTranslations('admin.crm');
  const data = parseCampaignData(campaignData);
  const interests = (data.interests ?? []).map(id => campaign.interestLabels[id] ?? id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">
          {t('respostasCampanha')}{' '}
          <span className="text-gray-400 font-normal">({campaign.label})</span>
        </h2>
      </div>

      <div className="px-5 py-1">
        <Row label={t('interesses')}>
          {interests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {interests.map(label => (
                <span
                  key={label}
                  className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </Row>

        {data.children_ages && (
          <Row label={t('idadeCriancas')}>{data.children_ages}</Row>
        )}

        {data.phone_country && (
          <Row label={t('paisTelefone')}>
            {data.phone_country === 'other' ? (
              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                ⚠️ {PHONE_COUNTRY_LABELS.other}
              </span>
            ) : (
              PHONE_COUNTRY_LABELS[data.phone_country]
            )}
          </Row>
        )}

        {data.consent_at && (
          <Row label={t('consentimentoEm')}>{fmtDateTime(data.consent_at)}</Row>
        )}
      </div>
    </div>
  );
}
