export type LeadSource = 'calculator' | 'email' | 'whatsapp' | 'instagram' | 'referral' | 'other';

const SOURCE_MAP: Record<LeadSource, { label: string; className: string }> = {
  calculator: { label: 'Calculadora', className: 'bg-slate-100 text-slate-600' },
  email: { label: 'E-Mail', className: 'bg-indigo-100 text-indigo-700' },
  whatsapp: { label: 'WhatsApp', className: 'bg-green-100 text-green-700' },
  instagram: { label: 'Instagram', className: 'bg-pink-100 text-pink-700' },
  referral: { label: 'Indicação', className: 'bg-orange-100 text-orange-700' },
  other: { label: 'Outro', className: 'bg-gray-100 text-gray-600' },
};

export default function SourceBadge({ source }: { source: LeadSource }) {
  const { label, className } = SOURCE_MAP[source] ?? SOURCE_MAP.other;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}
