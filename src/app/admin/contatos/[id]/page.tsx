import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import ContactProfile from '@/components/admin/ContactProfile';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('admin.contatos');
  const supabase = await createClient();
  const { data } = await supabase
    .from('contacts')
    .select('name, email')
    .eq('id', id)
    .single();
  return { title: data?.name ?? data?.email ?? t('metaTitleDetalhe') };
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('admin.contatos');
  const supabase = await createClient();

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('id, email, name')
    .eq('id', id)
    .single();

  if (error || !contact) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-6 pt-4">
        <Link
          href="/admin/contatos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('voltarParaContatos')}
        </Link>
      </div>
      <div className="flex-1">
        <ContactProfile
          contactId={contact.id}
          contactEmail={contact.email}
          contactName={contact.name}
        />
      </div>
    </div>
  );
}
