import Link from 'next/link';
import { getAdminTranslations } from '@/i18n/admin';

/**
 * Abas Lista | Analytics das propostas. O Analytics saiu da sidebar quando ela
 * virou categorias (sem terceiro nível), e passou a ser acessado por aqui.
 */
export default async function PropostasTabs({ active }: { active: 'lista' | 'analytics' }) {
  const t = await getAdminTranslations('admin.nav');
  const tabs = [
    { key: 'lista', href: '/admin/propostas', label: t('propostasLista') },
    { key: 'analytics', href: '/admin/propostas/analytics', label: t('analytics') },
  ] as const;

  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? 'page' : undefined}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.key
              ? 'border-green-600 text-green-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
