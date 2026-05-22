// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    label: 'Übersicht',
    href: '/admin',
    icon: '📊',
    exact: true,
  },
  {
    label: 'Benutzer',
    href: '/admin/users',
    icon: '👥',
  },
  {
    label: 'Guide-Inhalte',
    href: '/admin/guide',
    icon: '📖',
  },
  {
    label: 'Bewertungen',
    href: '/admin/bewertungen',
    icon: '⭐',
  },
  {
    label: 'Propostas',
    href: '/admin/propostas',
    icon: '📋',
    children: [
      { label: 'Atividades',  href: '/admin/propostas/atividades' },
      { label: 'Transportes', href: '/admin/propostas/transportes' },
    ],
  },
  {
    label: 'Clientes',
    href: '/admin/clientes',
    icon: '🧳',
  },
  {
    label: 'E-Mail Templates',
    href: '/admin/email-templates',
    icon: '✉️',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const isChildActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo / Título */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/admin" className="block">
          <p className="text-sm font-bold text-gray-900">⚙️ Admin</p>
          <p className="text-xs text-gray-400">Rio für Deutsche</p>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
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

            {item.children && item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2 ml-8 pl-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isChildActive(child.href)
                    ? 'text-green-700 bg-green-50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-300">›</span>
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
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
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <span>📗</span>
          <span>Guide-Vorschau</span>
        </Link>
      </div>
    </aside>
  );
}
