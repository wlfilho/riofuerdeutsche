'use server'

import { getSettings, buildContactUrls, type ContactUrls } from '@/lib/settings'

/**
 * Returns the business contact URLs (phone, whatsapp, socials, ...) sourced from
 * Supabase. Use this in Client Components that need contact data — it keeps the
 * DB the single source of truth instead of hardcoding numbers.
 */
export async function getPublicContact(): Promise<ContactUrls> {
  return buildContactUrls(await getSettings())
}
