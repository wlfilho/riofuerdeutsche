// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    label: 'Kontakte',
    href: '/admin/contatos',
    icon: '👥',
  },
  {
    label: 'CRM',
    href: '/admin/crm',
    icon: '🎯',
  },
  {
    label: 'Calendário',
    href: '/admin/calendario',
    icon: '📅',
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
    label: 'E-Mail Templates',
    href: '/admin/email-templates',
    icon: '✉️',
  },
  {
    label: 'Configurações',
    href: '/admin/configuracoes',
    icon: '⚙️',
  },
];

const footerItems = [
  { label: 'Zur Website', href: '/', icon: '🌐' },
  { label: 'Guide-Vorschau', href: '/dashboard', icon: '📗' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const isChildActive = (href: string) => pathname.startsWith(href);

  return (
    <aside
      className={`bg-white border-r border-gray-200 min-h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo / Título */}
      <div
        className={`p-4 border-b border-gray-100 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <Link href="/admin" className="block min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">⚙️ Admin</p>
            <p className="text-xs text-gray-400 truncate">Rio für Deutsche</p>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" title="Admin" className="text-lg leading-none">
            ⚙️
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0 ${
            collapsed ? 'hidden' : ''
          }`}
          title="Sidebar einklappen"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle button when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-2 pb-1">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            title="Sidebar ausklappen"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item)
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>

            {!collapsed && item.children && item.children.map((child) => (
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
      <div className="p-2 border-t border-gray-100 space-y-0.5">
        {footerItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}
