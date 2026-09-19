/**
 * Cronômetro de tour: ferramenta de campo, usada com cliente ao lado.
 *
 * Fora do layout do /admin de propósito. A sidebar existe para navegar entre
 * telas de escritório; aqui a tela inteira é um botão, e qualquer cromo em
 * volta só aumenta a chance de tocar errado andando.
 *
 * A proteção é dupla, como no resto do admin: o middleware barra por rota e
 * este layout confere de novo no servidor. Texto em pt-BR direto no código,
 * como em /motorista — quem usa é o Will, e o catálogo pt-BR não existe fora
 * do namespace do admin.
 */
import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import { getMembershipAccess } from '@/lib/membership';

export const metadata: Metadata = {
  // `absolute` porque o layout raiz aplica um template com o nome do site; sem
  // isto o título sai "… | Rio für Deutsche | Rio für Deutsche".
  title: { absolute: 'Cronômetro de tour | Rio für Deutsche' },
  robots: { index: false, follow: false },
  manifest: '/cronometro.webmanifest',
  // O iOS ignora o manifest para isto: sem estas chaves, "Adicionar à tela de
  // início" abre o app dentro do Safari, com barra de endereço ocupando espaço
  // e gesto de voltar no meio do caminho.
  appleWebApp: {
    capable: true,
    title: 'Cronômetro',
    statusBarStyle: 'black-translucent',
  },
  icons: { apple: '/android-chrome-192x192.png' },
  // O Next só emite `mobile-web-app-capable`, que é o padrão atual. O Safari
  // anterior ao iOS 17.4 lê exclusivamente a variante com prefixo apple-, e
  // sem ela o atalho abre dentro do navegador, com barra de endereço e gesto
  // de voltar no caminho. Os dois convivem sem conflito.
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  // Tela cheia até a borda no iPhone com notch; o padding seguro é aplicado
  // no CSS via env(safe-area-inset-*).
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default async function CronometroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getMembershipAccess();
  if (!access.isAdmin) redirect('/');

  return <div className="min-h-[100dvh] bg-slate-900 text-slate-100">{children}</div>;
}
