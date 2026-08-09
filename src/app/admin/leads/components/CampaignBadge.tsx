import { campaignLabel } from '@/lib/campaigns';

export default function CampaignBadge({ campaign }: { campaign: string | null }) {
  if (!campaign) return null;
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
      {campaignLabel(campaign) ?? campaign}
    </span>
  );
}
