import { getAdminTranslations } from '@/i18n/admin';
import { fmtEur } from '@/lib/adminFormat';

type Activity = {
  id: string;
  name: string;
  duration_min: number;
  price_eur: number;
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export default async function LeadActivities({ activities }: { activities: unknown }) {
  const t = await getAdminTranslations('admin.crm');
  const items: Activity[] = Array.isArray(activities)
    ? (activities as Activity[]).filter(
        a => a && typeof a === 'object' && 'name' in a
      )
    : [];

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('atividadesSelecionadas')}</h2>
        <p className="text-xs text-gray-400 italic">
          {t('leadSemAtividades')}
        </p>
      </div>
    );
  }

  const totalMinutes = items.reduce((s, a) => s + a.duration_min, 0);
  const totalPrice = items.reduce((s, a) => s + a.price_eur, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">
          {t('atividadesSelecionadas')}{' '}
          <span className="text-gray-400 font-normal">({items.length})</span>
        </h2>
      </div>

      <div className="divide-y divide-gray-50">
        {items.map((activity, i) => (
          <div key={activity.id ?? i} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-800">{activity.name}</span>
            </div>
            <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
              {formatDuration(activity.duration_min)}
            </span>
            <span className="text-sm font-medium text-gray-700 tabular-nums w-16 text-right">
              {fmtEur(activity.price_eur)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t('totalEstimado')}
        </div>
        <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
          {formatDuration(totalMinutes)}
        </span>
        <span className="text-sm font-bold text-gray-800 tabular-nums w-16 text-right">
          {fmtEur(totalPrice)}
        </span>
      </div>
    </div>
  );
}
