// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Übersicht',
    href: '/dashboard',
    icon: '📊',
    exact: true, // Só ativo quando é exatamente /dashboard
  },
  {
    label: 'Benutzer',
    href: '/dashboard/users',
    icon: '👥',
  },
  {
    label: 'Guide-Inhalte',
    href: '/dashboard/guide',
    icon: '📖',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo / Título */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="block">
          <p className="text-sm font-bold text-gray-900">⚙️ Admin</p>
          <p className="text-xs text-gray-400">Rio für Deutsche</p>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item)
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-3 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <span>🌐</span>
          <span>Zur Website</span>
        </Link>
        <Link
          href="/guide"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <span>📗</span>
          <span>Guide-Vorschau</span>
        </Link>
      </div>
    </aside>
  );
}
