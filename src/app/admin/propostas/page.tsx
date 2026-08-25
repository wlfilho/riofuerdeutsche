import Link from 'next/link';
import { getAdminTranslations } from '@/i18n/admin';
import { getProposals } from '@/lib/proposals';
import { getProposalAnalyticsSummaries } from '@/lib/proposalAnalytics';
import { getProposalEmailStatuses } from '@/lib/email/sendProposalEmail';
import { createClient } from '@/utils/supabase/server';
import PropostasListClient from './PropostasListClient';
import AnfrageLinkButton from './AnfrageLinkButton';
import PendingLeadsRows from './PendingLeadsRows';
import GroupFilter from '@/components/admin/GroupFilter';
import GroupBadges from '@/components/admin/GroupBadges';
import { fetchLeadGroupsMap, matchesGroup, type LeadGroup } from '@/lib/leadGroups';
import { daysSince } from '@/lib/adminFormat';

type PendingLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  contact_id: string;
  pax: number;
  children: number | null;
  requested_days: string[] | null;
  source: string;
  status: 'new' | 'contacted';
  groups: LeadGroup[];
  created_at: string;
};

// Data curta pro chip do lead: dd/MM, sem ano (o ano cabe no contexto da lista).
function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}`;
}

// Cor do aviso de espera: quem chegou há mais tempo sem resposta pesa mais —
// leads são a porta de entrada, uma demora aqui custa a venda inteira.
function waitingClassName(days: number): string {
  if (days >= 5) return 'text-red-600 font-semibold';
  if (days >= 2) return 'text-amber-700 font-semibold';
  return 'text-gray-400';
}

// Mesmos limiares do texto, como faixa lateral — a urgência dá pra sentir
// antes de ler qualquer palavra do card.
function urgencyBorderClassName(days: number): string {
  if (days >= 5) return 'border-l-4 border-l-red-400';
  if (days >= 2) return 'border-l-4 border-l-amber-400';
  return 'border-l-4 border-l-gray-200';
}

async function PendingLeadsStrip({ leads }: { leads: PendingLead[] }) {
  const t = await getAdminTranslations('admin.propostas');
  const tSource = await getAdminTranslations('admin.status.source');
  const tLeadStatus = await getAdminTranslations('admin.status.lead');

  if (leads.length === 0) return null;

  // Mais antigo (quem espera há mais tempo) primeiro — PendingLeadsRows só
  // inverte esse array quando o admin troca a ordenação.
  const sorted = [...leads].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const newCount = leads.filter(l => l.status === 'new').length;
  const contactedCount = leads.filter(l => l.status === 'contacted').length;

  const rows = sorted.map(lead => {
    const waitingDays = daysSince(lead.created_at);
    return (
      <div
        key={lead.id}
        className={`bg-white border border-amber-100 ${urgencyBorderClassName(waitingDays)} rounded-lg px-4 py-3`}
      >
        {/* Linha 1 — o dado que a pessoa procura primeiro: quem é e quão
            urgente é responder. Nome em destaque, urgência sempre à direita. */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold text-gray-900 text-base">{lead.name}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              lead.status === 'new' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {tLeadStatus(lead.status)}
          </span>
          <span className={`ml-auto text-xs ${waitingClassName(waitingDays)}`}>
            {t('esperandoDias', { count: waitingDays })}
          </span>
        </div>

        {/* Linha 2 — contexto da viagem, tom neutro (não compete com a linha 1). */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
          <span>
            {lead.pax} pax
            {(lead.children ?? 0) > 0 && ` + ${t('criancas', { count: lead.children ?? 0 })}`}
          </span>
          {(lead.requested_days?.length ?? 0) > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span>📅 {(lead.requested_days ?? []).map(formatShortDate).join(' · ')}</span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">
            {t('via')}
            {tSource.has(lead.source) ? tSource(lead.source) : lead.source}
          </span>
        </div>

        {/* Linha 3 — contato direto: telefone (97% dos leads tem) vira link de
            WhatsApp, e-mail vira mailto. Antes só existia dentro do CRM. */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors tabular-nums"
            >
              💬 {lead.phone}
            </a>
          )}
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            ✉️ {lead.email}
          </a>
        </div>

        {/* Nota do CRM, só quando existe — mais da metade dos leads tem uma
            (preferência, restrição, contexto) e ficava invisível aqui. */}
        {lead.notes && (
          <p className="mt-2 text-xs italic text-gray-500 bg-gray-50 rounded-md px-2.5 py-1.5 truncate" title={lead.notes}>
            📝 {lead.notes}
          </p>
        )}

        {/* Linha final — etiquetas à esquerda, ações à direita. */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <GroupBadges groups={lead.groups} />
          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/admin/contatos/${lead.contact_id}`}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
            >
              {t('verPerfil')}
            </Link>
            <Link
              href={`/admin/propostas/nova?lead_id=${lead.id}`}
              className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shrink-0"
            >
              {t('criarProposta')}
            </Link>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-3">
        <h2 className="text-sm font-bold text-amber-900">
          {t('solicitacoesAguardando', { count: leads.length })}
        </h2>
        {(newCount > 0 || contactedCount > 0) && (
          <p className="text-xs text-amber-700">
            {[
              newCount > 0 ? t('contagemNovos', { count: newCount }) : null,
              contactedCount > 0 ? t('contagemContatados', { count: contactedCount }) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>
      <PendingLeadsRows rows={rows} defaultVisible={5} />
    </div>
  );
}

export default async function PropostasPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const t = await getAdminTranslations('admin.propostas');
  const supabase = await createClient();
  const [allProposals, analytics, emailStatuses, { data: pendingLeads }, { data: proposalLeads }, groupsByLead] =
    await Promise.all([
      getProposals(),
      getProposalAnalyticsSummaries(),
      getProposalEmailStatuses(),
      // Leads still in the pre-proposal pipeline; leads moved to lost/closed in
      // the CRM (or already linked to a proposal) drop out of this strip.
      supabase
        .from('price_leads')
        .select('id, name, email, phone, notes, contact_id, pax, children, requested_days, source, status, created_at')
        .is('proposal_id', null)
        .in('status', ['new', 'contacted'])
        .order('created_at', { ascending: false }),
      // `proposals` não guarda etiqueta: quem sabe de onde a proposta veio é o
      // lead que aponta para ela. Este mapa dá a etiqueta a cada proposta.
      supabase
        .from('price_leads')
        .select('id, proposal_id')
        .not('proposal_id', 'is', null),
      fetchLeadGroupsMap(supabase),
    ]);

  const groupsByProposal = new Map<string, LeadGroup[]>();
  for (const row of (proposalLeads ?? []) as { id: string; proposal_id: string }[]) {
    const groups = groupsByLead.get(row.id) ?? [];
    if (groups.length === 0) continue;
    const existing = groupsByProposal.get(row.proposal_id) ?? [];
    groupsByProposal.set(
      row.proposal_id,
      [...existing, ...groups.filter(g => !existing.some(e => e.id === g.id))],
    );
  }

  const proposals = allProposals.filter(p =>
    matchesGroup(groupsByProposal.get(p.id) ?? [], group),
  );
  const leads = ((pendingLeads ?? []) as Omit<PendingLead, 'groups'>[]).map(l => ({
    ...l,
    groups: groupsByLead.get(l.id) ?? [],
  })).filter(l => matchesGroup(l.groups, group));

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('titulo')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <GroupFilter value={group} />
            <AnfrageLinkButton />
            <Link
              href="/admin/propostas/nova"
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('novaProposta')}
            </Link>
          </div>
        </div>

        <PendingLeadsStrip leads={leads} />

        <PropostasListClient
          initialProposals={proposals}
          analytics={analytics}
          emailStatuses={emailStatuses}
          groupsByProposal={Object.fromEntries(groupsByProposal)}
        />
      </div>
    </div>
  );
}
