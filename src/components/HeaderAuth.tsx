// src/components/HeaderAuth.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, BookOpen, Settings, Star, ChevronDown, Loader2 } from 'lucide-react';

interface UserInfo {
  firstName: string | null;
  email: string;
  role: 'user' | 'premium' | 'admin';
}

export default function HeaderAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, email, role')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser({
            firstName: profile.first_name,
            email: profile.email,
            role: profile.role,
          });
        }
      }

      setLoading(false);
    };

    getUser();

    // Escutar mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, email, role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              firstName: profile.first_name,
              email: profile.email,
              role: profile.role,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-rio-green animate-spin" />
      </div>
    );
  }

  // Não logado — mostrar botão de login
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-rio-green transition-colors duration-200"
      >
        <User className="h-4 w-4 text-rio-green" />
        <span>Login</span>
      </Link>
    );
  }

  // Logado — mostrar nome + dropdown
  const displayName = user.firstName || user.email.split('@')[0];

  return (
    <div className="relative header-auth-dropdown">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-rio-green hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        {/* Avatar com inicial */}
        <span className="w-8 h-8 flex items-center justify-center bg-rio-green/10 text-rio-green text-xs font-bold rounded-full border border-rio-green/20">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline font-bold">{displayName}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-3 transform origin-top translate-y-0 transition-all duration-200">
          {/* User info */}
          <div className="px-5 py-2 border-b border-gray-50 mb-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.firstName || 'Benutzer'}
            </p>
            <p className="text-[11px] text-gray-500 truncate mb-2">{user.email}</p>
            <span
              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                user.role === 'admin'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : user.role === 'premium'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  : 'bg-green-50 text-green-700 border border-green-100'
              }`}
            >
              {user.role === 'admin'
                ? '🔑 Admin'
                : user.role === 'premium'
                ? '⭐ Premium'
                : 'Kostenlos'}
            </span>
          </div>

          {/* Links */}
          <div className="px-2 space-y-1">
            {/* Link para o Guide */}
            <Link
              href={user.role === 'premium' || user.role === 'admin' ? '/guide' : '/guide/sicherheit'}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Mein Guide</span>
            </Link>

            {/* Link para Dashboard (só admin) */}
            {user.role === 'admin' && (
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* CTA de Upgrade (só para user gratuito) */}
            {user.role === 'user' && (
              <Link
                href="/guide?upgrade=true"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rio-blue hover:bg-rio-blue/5 rounded-xl transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Guide freischalten</span>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="mt-2 pt-2 border-t border-gray-50 px-2 text-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
