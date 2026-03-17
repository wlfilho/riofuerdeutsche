// src/types/membership.ts

export type UserRole = 'user' | 'premium' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
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
}
