import Link from 'next/link';
import { getProposals } from '@/lib/proposals';
import PropostasListClient from './PropostasListClient';

export default async function PropostasPage() {
  const proposals = await getProposals();

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
          <Link
            href="/admin/propostas/nova"
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nova Proposta
          </Link>
        </div>

        <PropostasListClient initialProposals={proposals} />
      </div>
    </div>
  );
}
