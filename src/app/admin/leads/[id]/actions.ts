'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { LeadStatus } from '../page';

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');
  return { supabase, userId: user.id };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ error?: string }> {
  try {
    const { supabase } = await adminClient();
    const { error } = await supabase
      .from('price_leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath('/admin/leads');
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

/**
 * Arquiva ou desarquiva o lead. Booleano na assinatura e timestamp na tabela:
 * quem arquivou quer saber quando, mas a UI só precisa ligar/desligar.
 */
export async function setLeadArchived(
  leadId: string,
  archived: boolean
): Promise<{ error?: string }> {
  try {
    const { supabase } = await adminClient();
    const { error } = await supabase
      .from('price_leads')
      .update({
        archived_at: archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath('/admin/leads');
    revalidatePath('/admin/crm');
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

export async function updateLeadNotes(
  leadId: string,
  notes: string
): Promise<{ error?: string }> {
  try {
    const { supabase } = await adminClient();
    const { error } = await supabase
      .from('price_leads')
      .update({ notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) return { error: error.message };
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

export async function registerContact(
  leadId: string,
  type: 'whatsapp' | 'email' | 'phone' | 'other',
  direction: 'sent' | 'received',
  note: string | null
): Promise<{ contact?: Record<string, unknown>; error?: string }> {
  try {
    const { supabase, userId } = await adminClient();
    const { data: contact, error } = await supabase
      .from('lead_contacts')
      .insert({
        lead_id: leadId,
        type,
        direction,
        note: note || null,
        is_automatic: false,
        created_by: userId,
      })
      .select()
      .single();
    if (error) return { error: error.message };
    revalidatePath(`/admin/leads/${leadId}`);
    return { contact: contact as Record<string, unknown> };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
}

export async function deleteLead(leadId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await adminClient();
    const { error } = await supabase.from('price_leads').delete().eq('id', leadId);
    if (error) return { error: error.message };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Erro desconhecido' };
  }
  redirect('/admin/leads');
}
