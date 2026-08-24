import type { LeadGroup } from '@/lib/leadGroups';

/**
 * Badges das etiquetas de um lead — sucessor do antigo CampaignBadge agora
 * que toda campanha também é uma `lead_group`, e um lead pode ter várias.
 */
export default function GroupBadges({ groups }: { groups: LeadGroup[] }) {
  if (!groups || groups.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {groups.map(group => (
        <span
          key={group.id}
          className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200"
        >
          {group.name}
        </span>
      ))}
    </div>
  );
}
