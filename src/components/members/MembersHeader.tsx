"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, BookOpen, Settings, Star, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface MembersHeaderProps {
  userName: string;
  userEmail: string;
  userRole: "user" | "premium" | "admin";
}

export default function MembersHeader({ userName, userEmail, userRole }: MembersHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [supabase] = useState(() => createClient());

  const getInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "U";
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".members-auth-dropdown")) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleLinkClick = () => {
    setDropdownOpen(false);
  };

  const roleBadge = () => {
    if (userRole === "admin") return { label: "🛡️ Admin", className: "bg-red-50 text-red-600 border border-red-100" };
    if (userRole === "premium") return { label: "⭐ Premium", className: "bg-yellow-50 text-yellow-700 border border-yellow-100" };
    return { label: "Kostenlos", className: "bg-green-50 text-green-700 border border-green-100" };
  };

  const badge = roleBadge();

  return (
    <header className="sticky top-0 z-[120] bg-white lg:bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 w-full">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading font-black text-2xl tracking-tight text-rio-green flex items-center gap-2 group relative"
        >
          <MapPin className="h-7 w-7 text-rio-yellow group-hover:-translate-y-1 transition-transform" />
          <span>Rio<span className="text-rio-blue font-light">FürDeutsche</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 items-center" aria-label="Members Navigation">
          <a
            href="https://riofuerdeutsche.de"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-sm font-medium text-gray-500 hover:text-rio-green transition-colors duration-200"
          >
            ↗ riofuerdeutsche.de
          </a>
          <Link
            href="/guide"
            className={`p-2 text-sm transition-colors duration-200 ${
              pathname === "/guide" || pathname?.startsWith("/guide/")
                ? "font-bold text-rio-green"
                : "font-medium text-gray-700 hover:text-rio-green"
            }`}
          >
            Rio-Guide
          </Link>
          <a
            href="https://riofuerdeutsche.de/kontakt"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-sm font-medium text-gray-700 hover:text-rio-green transition-colors duration-200"
          >
            Kontakt
          </a>
        </nav>

        {/* User Dropdown */}
        <div className="relative members-auth-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-rio-green hover:bg-gray-50 rounded-lg transition-all duration-200"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span className="w-8 h-8 flex items-center justify-center bg-rio-green/10 text-rio-green text-xs font-bold rounded-full border border-rio-green/20">
              {getInitial(userName)}
            </span>
            <span className="hidden sm:inline font-bold">{userName}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 py-3">
              {/* User info */}
              <div className="px-5 py-2 border-b border-gray-50 mb-2">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-[11px] text-gray-500 truncate mb-2">{userEmail}</p>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              {/* Menu items */}
              <div className="px-2 space-y-1">
                <Link
                  href={userRole === "premium" || userRole === "admin" ? "/guide" : "/guide/sicherheit-rio"}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Mein Guide</span>
                </Link>

                {userRole === "admin" && (
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-rio-green/5 hover:text-rio-green rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {userRole === "user" && (
                  <Link
                    href="/guide?upgrade=true"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rio-blue hover:bg-rio-blue/5 rounded-xl transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>Guide freischalten</span>
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="mt-2 pt-2 border-t border-gray-50 px-2">
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
      </div>
    </header>
  );
}
