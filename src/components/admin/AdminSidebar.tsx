// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

type NavLink = { labelKey: string; href: string };
type NavGroup = { labelKey: string; icon: string; items: NavLink[] };

/** Link solto no topo, fora de categoria. */
const homeItem = { labelKey: 'visaoGeral', href: '/admin', icon: '📊' };

// Categorias: o cabeçalho só abre e fecha, não tem página própria.
const navGroups: NavGroup[] = [
  {
    labelKey: 'vendas',
    icon: '🎯',
    items: [
      { labelKey: 'crm', href: '/admin/crm' },
      { labelKey: 'contatos', href: '/admin/contatos' },
      { labelKey: 'propostas', href: '/admin/propostas' },
      { labelKey: 'atividades', href: '/admin/propostas/atividades' },
    ],
  },
  {
    labelKey: 'operacao',
    icon: '📅',
    items: [
      { labelKey: 'calendario', href: '/admin/calendario' },
      { labelKey: 'cronometro', href: '/cronometro' },
    ],
  },
  {
    labelKey: 'marketing',
    icon: '📣',
    items: [
      { labelKey: 'campanhas', href: '/admin/campanhas' },
      { labelKey: 'templatesEmail', href: '/admin/email-templates' },
      { labelKey: 'avaliacoes', href: '/admin/bewertungen' },
      { labelKey: 'analyticsSite', href: '/admin/analytics' },
    ],
  },
  {
    labelKey: 'rioGuide',
    icon: '📖',
    items: [
      { labelKey: 'conteudoGuide', href: '/admin/guide' },
      { labelKey: 'usuarios', href: '/admin/users' },
    ],
  },
  {
    labelKey: 'configuracoes',
    icon: '⚙️',
    items: [
      { labelKey: 'configuracoesGeral', href: '/admin/configuracoes' },
      { labelKey: 'transportes', href: '/admin/propostas/transportes' },
    ],
  },
];

/**
 * Href do item ativo: o mais específico que casa com a rota. Atividades
 * (/admin/propostas/atividades) mora dentro de /admin/propostas, e sem isso
 * as duas acenderiam juntas.
 */
function activeHref(pathname: string): string | null {
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const candidates = navGroups
    .flatMap((g) => g.items)
    .filter((item) => matches(item.href))
    .map((item) => item.href);
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (b.length > a.length ? b : a));
}

const footerItems = [
  { labelKey: 'irParaSite', href: '/', icon: '🌐' },
  { labelKey: 'previaGuide', href: '/dashboard', icon: '📗' },
];

function SidebarNav({
  collapsed,
  onNavigate,
  onExpand,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  /** Recolhida: clicar no ícone de uma categoria abre a sidebar. */
  onExpand?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations('admin.nav');

  const currentHref = activeHref(pathname);
  const routeGroup =
    navGroups.find((g) => g.items.some((item) => item.href === currentHref))?.labelKey ?? null;

  // Sanfona: uma categoria aberta por vez. Sem clique manual, abre a da página
  // atual. O clique manual vale só enquanto a rota não muda, por isso guarda o
  // pathname junto (derivado no render, sem useEffect).
  const [manual, setManual] = useState<{ path: string; open: string | null } | null>(null);
  const openGroup = manual && manual.path === pathname ? manual.open : routeGroup;

  const handleGroupClick = (key: string) => {
    if (collapsed) {
      // Recolhida: expande já com a categoria clicada aberta.
      setManual({ path: pathname, open: key });
      onExpand?.();
      return;
    }
    setManual({ path: pathname, open: openGroup === key ? null : key });
  };

  const homeActive = pathname === homeItem.href;

  return (
    <>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <Link
          href={homeItem.href}
          title={collapsed ? t(homeItem.labelKey) : undefined}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            homeActive
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <span className="flex-shrink-0">{homeItem.icon}</span>
          {!collapsed && <span className="truncate">{t(homeItem.labelKey)}</span>}
        </Link>

        {navGroups.map((group) => {
          const isOpen = !collapsed && openGroup === group.labelKey;
          const hasActive = routeGroup === group.labelKey;
          return (
            <div key={group.labelKey}>
              <button
                type="button"
                onClick={() => handleGroupClick(group.labelKey)}
                title={collapsed ? t(group.labelKey) : undefined}
                aria-expanded={isOpen}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  collapsed && hasActive
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : hasActive
                      ? 'text-gray-900 hover:bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <span className="flex-shrink-0">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{t(group.labelKey)}</span>
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>

              {isOpen && (
                <div className="mt-0.5 mb-1 space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 ml-6 pl-3 pr-2 py-1.5 rounded-lg text-sm transition-colors ${
                        item.href === currentHref
                          ? 'bg-green-50 text-green-800 font-medium'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer da sidebar */}
      <div className="p-2 border-t border-gray-100 space-y-0.5">
        {footerItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? t(item.labelKey) : undefined}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
          </Link>
        ))}
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations('admin.nav');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  // Fecha o drawer ao navegar e trava o scroll do body enquanto aberto
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <>
      {/* Topbar mobile com hamburger */}
      <header className="md:hidden sticky top-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center gap-2 px-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={t('abrirMenu')}
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/admin" className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">⚙️ Admin</p>
        </Link>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">⚙️ Admin</p>
                <p className="text-xs text-gray-400 truncate">Rio für Deutsche</p>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0"
                aria-label={t('fecharMenu')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside
        className={`hidden md:flex bg-white border-r border-gray-200 min-h-screen flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
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
            <Link href="/admin" title={t('admin')} className="text-lg leading-none">
              ⚙️
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0 ${
              collapsed ? 'hidden' : ''
            }`}
            title={t('recolherSidebar')}
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
              title={t('expandirSidebar')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <SidebarNav
          collapsed={collapsed}
          onExpand={() => {
            setCollapsed(false);
            localStorage.setItem('admin-sidebar-collapsed', 'false');
          }}
        />
      </aside>
    </>
  );
}
