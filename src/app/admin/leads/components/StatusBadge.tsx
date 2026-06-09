export type LeadStatus = 'new' | 'contacted' | 'proposal_sent' | 'closed' | 'lost';

const STATUS_MAP: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Em Contato', className: 'bg-amber-100 text-amber-700' },
  proposal_sent: { label: 'Proposta Enviada', className: 'bg-purple-100 text-purple-700' },
  closed: { label: 'Fechado ✓', className: 'bg-green-100 text-green-700' },
  lost: { label: 'Perdido', className: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}
