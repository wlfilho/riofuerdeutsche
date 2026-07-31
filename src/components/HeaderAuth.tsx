// src/components/HeaderAuth.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Settings, Star, ChevronDown, Loader2 } from 'lucide-react';

interface UserInfo {
  firstName: string | null;
  email: string;
  role: 'user' | 'premium' | 'admin';
}

interface HeaderAuthProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function HeaderAuth({ isMobile, onItemClick }: HeaderAuthProps) {
  const tAuth = useTranslations('public.auth');
  const tDash = useTranslations('public.dashboard');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Usar uma única instância do client
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string) => {
      try {
        console.log('HeaderAuth: Fetching profile for', userId);
        
        // Timeout the fetch ourselves just in case Supabase hangs due to ERR_BLOCKED_BY_CLIENT
        const fetchPromise = supabase
          .from('profiles')
          .select('first_name, email, role')
          .eq('id', userId)
          .single();
          
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 4000)
        );
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (response?.error) {
          console.error('HeaderAuth: Profile fetch error:', response.error);
          return null;
        }

        console.log('HeaderAuth: Profile found:', response?.data);
        return response?.data;
      } catch (err) {
        console.warn('HeaderAuth: fallback after fetch error/timeout:', err);
        return null;
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user ?? null;

        if (authUser && mounted) {
          // Fallback imediato com os dados do Auth
          setUser({
            firstName: authUser.user_metadata?.first_name || authUser.user_metadata?.name || null,
            email: authUser.email || '',
            role: (authUser.user_metadata?.role || 'user') as 'user' | 'premium' | 'admin',
          });
          setLoading(false);
          
          const profile = await fetchProfile(authUser.id);
          if (profile && mounted) {
            setUser({
              firstName: profile.first_name || authUser.user_metadata?.first_name || null,
              email: profile.email || authUser.email || '',
              role: (profile.role || 'user') as 'user' | 'premium' | 'admin',
            });
          }
        }
      } catch (error) {
        console.error('HeaderAuth Init Error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('HeaderAuth: Initial loading finished');
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('HeaderAuth: Auth event:', event);
        if (!mounted) return;

        if (session?.user) {
          setUser({
            firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.name || null,
            email: session.user.email || '',
            role: (session.user.user_metadata?.role || 'user') as 'user' | 'premium' | 'admin',
          });
          setLoading(false);

          const profile = await fetchProfile(session.user.id);
          if (profile && mounted) {
            setUser({
              firstName: profile.first_name || session.user.user_metadata?.first_name || null,
              email: profile.email || session.user.email || '',
              role: (profile.role || 'user') as 'user' | 'premium' | 'admin',
            });
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('HeaderAuth: Loading timeout triggered');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.header-auth-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    if (onItemClick) onItemClick();
    router.push('/');
    router.refresh();
  };

  const handleLinkClick = () => {
    setDropdownOpen(false);
    if (onItemClick) onItemClick();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${isMobile ? 'py-4' : 'w-10 h-10'}`}>
        <Loader2 className="h-5 w-5 text-rio-green animate-spin" />
      </div>
    );
  }

  // NÃO LOGADO
  if (!user) {
    return (
      <Link
        href="/login"
        onClick={handleLinkClick}
        className={
          isMobile
            ? "flex items-center gap-3 text-2xl font-bold text-gray-900 hover:text-rio-green transition-colors"
            : "flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-rio-green transition-colors duration-200"
        }
      >
        <User className={isMobile ? "h-6 w-6 text-rio-green" : "h-4 w-4 text-rio-green"} />
        <span>{tAuth('anmelden')}</span>
      </Link>
    );
  }

  // LOGADO
  const displayName = user.firstName || user.email.split('@')[0];

  // Versão Mobile (sem dropdown, links diretos ou simplificados)
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="w-12 h-12 flex items-center justify-center bg-rio-green/10 text-rio-green text-xl font-bold rounded-full border border-rio-green/20">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <p className="text-xl font-bold text-gray-900">{tDash('hallo', { name: displayName })}</p>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {user.role === 'admin' ? tDash('rollen.admin') : user.role === 'premium' ? tDash('rollen.premium') : tDash('rollen.gratisKonto')}
          </span>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold text-lg border border-gray-100"
          >
            <BookOpen className="w-5 h-5 text-rio-green" />
            {tDash('meinGuide')}
          </Link>

          {user.role === 'admin' && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold text-lg border border-gray-100"
            >
              <Settings className="w-5 h-5 text-rio-blue" />
              {tDash('dashboard')}
            </Link>
          )}

          {user.role === 'user' && (
            <Link
              href="/dashboard?upgrade=true"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 py-3 bg-rio-blue/5 text-rio-blue rounded-xl font-bold text-lg border border-rio-blue/10"
            >
              <Star className="w-5 h-5" />
              {tDash('upgradeAufPremium')}
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-3 text-red-500 font-bold text-lg"
          >
            <LogOut className="w-5 h-5" />
            {tAuth('abmelden')}
          </button>
        </div>
      </div>
    );
  }

  // Versão Desktop (Dropdown)
  return (
    <div className="relative header-auth-dropdown">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-rio-green hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        <span className="w-8 h-8 flex items-center justify-center bg-rio-green/10 text-rio-green text-xs font-bold rounded-full border border-rio-green/20">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline font-bold">{displayName}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-3">
          <div className="px-5 py-2 border-b border-gray-50 mb-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.firstName || tDash('benutzer')}
            </p>
            <p className="text-[11px] text-gray-500 truncate mb-2">{user.email}</p>
            <span
              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${user.role === 'admin'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : user.role === 'premium'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    : 'bg-green-50 text-green-700 border border-green-100'
                }`}
            >
              {user.role === 'admin' ? tDash('rollen.admin') : user.role === 'premium' ? tDash('rollen.premium') : tDash('rollen.kostenlos')}
            </span>
          </div>

          <div className="px-2 space-y-1">
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>{tDash('meinGuide')}</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{tDash('dashboard')}</span>
              </Link>
            )}

            {user.role === 'user' && (
              <Link
                href="/dashboard?upgrade=true"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rio-blue hover:bg-rio-blue/5 rounded-xl transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>{tDash('guideFreischalten')}</span>
              </Link>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-50 px-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{tAuth('abmelden')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
