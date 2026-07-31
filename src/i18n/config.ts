export const locales = ['de', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];
export const defaultPublicLocale: Locale = 'de';
export const adminLocale: Locale = 'pt-BR';

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

/**
 * The admin panel always runs in pt-BR; everything else is the public side,
 * which is de-only for now. URLs carry no locale prefix yet — that arrives
 * later, and only for the neutral proposal route.
 */
export function localeForPathname(pathname: string | null | undefined): Locale {
  return pathname?.startsWith('/admin') ? adminLocale : defaultPublicLocale;
}
