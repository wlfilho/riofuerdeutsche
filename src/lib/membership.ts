// src/lib/membership.ts
import { createClient } from '@/utils/supabase/server';
import type { MembershipAccess, UserProfile } from '@/types/membership';

/**
 * Busca o profile do usuário logado e retorna o objeto de acesso.
 * Usar em Server Components e Route Handlers.
 */
export async function getMembershipAccess(): Promise<MembershipAccess> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      isPremium: false,
      hasLeadMagnet: false,
      role: null,
      guideEdition: null,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return {
      isAuthenticated: true,
      isAdmin: false,
      isPremium: false,
      hasLeadMagnet: false,
      role: 'user',
      guideEdition: null,
    };
  }

  const typedProfile = profile as UserProfile;

  const isAdmin = typedProfile.role === 'admin';

  // Premium ativo: admin sempre, ou role='premium' sem expiração,
  // ou role='premium' com expiração no futuro
  const isPremium =
    isAdmin ||
    (typedProfile.role === 'premium' &&
      (!typedProfile.premium_until ||
        new Date(typedProfile.premium_until) > new Date()));

  return {
    isAuthenticated: true,
    isAdmin,
    isPremium,
    hasLeadMagnet: true, // qualquer usuário registrado
    role: typedProfile.role,
    guideEdition: typedProfile.guide_edition,
  };
}

/**
 * Busca o profile completo do usuário logado.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as UserProfile | null;
}
