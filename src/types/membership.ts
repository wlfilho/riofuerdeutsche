// src/types/membership.ts

// 'driver' é o motorista escalado nos tours: não é membro do Guide — o login
// dele leva para /motorista, não para /dashboard.
export type UserRole = 'user' | 'premium' | 'admin' | 'driver';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  role: UserRole;
  created_at: string;
  premium_since: string | null;
  premium_until: string | null;
  payment_id: string | null;
  guide_edition: number | null;
}

export interface MembershipAccess {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;       // true se role='premium' E acesso ativo (ou admin)
  hasLeadMagnet: boolean;   // true se registrado (qualquer role)
  role: UserRole | null;
  guideEdition: number | null;
  firstName: string | null;
}
