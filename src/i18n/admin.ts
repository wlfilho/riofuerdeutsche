import { getTranslations, getMessages } from 'next-intl/server';
import { adminLocale } from './config';

/**
 * Fonte única do locale do admin nos Server Components.
 *
 * Por que não depender do middleware: a propagação via `request.headers.set()`
 * funciona no runtime Node (dev e `next start` local), mas não é confiável no
 * edge da Vercel — o request de entrada é imutável lá, o header some, o locale
 * cai no default `de` (catálogo vazio) e a UI renderiza as chaves cruas.
 *
 * Aqui o locale é explícito e determinístico: o admin é sempre pt-BR, em
 * qualquer runtime. O lado público continua resolvendo pelo default.
 *
 * Uso:
 *   const t = await getAdminTranslations('admin.crm');
 */
export async function getAdminTranslations(namespace: string) {
  return getTranslations({ locale: adminLocale, namespace });
}

/** Mensagens completas do locale do admin, para o NextIntlClientProvider. */
export async function getAdminMessages() {
  return getMessages({ locale: adminLocale });
}

export { adminLocale };
