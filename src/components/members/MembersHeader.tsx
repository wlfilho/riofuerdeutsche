"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";

interface MembersHeaderProps {
  userName: string;
  userPlan: "free" | "premium";
}

export default function MembersHeader({ userName, userPlan }: MembersHeaderProps) {
  const pathname = usePathname();

  const getInitial = (name: string) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-[120] bg-white lg:bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 w-full">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo (idêntico ao site público) */}
        <Link
            href="/"
            className="font-heading font-black text-2xl tracking-tight text-rio-green flex items-center gap-2 group relative"
        >
            <MapPin className="h-7 w-7 text-rio-yellow group-hover:-translate-y-1 transition-transform" />
            <span>Rio<span className="text-rio-blue font-light">FürDeutsche</span></span>
        </Link>

        {/* Desktop Navigation (Diferença 1) */}
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

        {/* Lado direito (Diferença 2) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end justify-center">
            <span className="text-sm font-bold text-gray-900 leading-tight">
              {userName}
            </span>
            {userPlan === "premium" ? (
              <span className="text-xs font-semibold text-rio-green leading-tight">
                Premium ✓
              </span>
            ) : (
              <span className="text-xs font-semibold text-gray-500 leading-tight">
                Free Plan
              </span>
            )}
          </div>
          
          <div className="w-[32px] h-[32px] rounded-full bg-[#0d1f15] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-[800] text-[#f5c518] mt-[1px]">
              {getInitial(userName)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
