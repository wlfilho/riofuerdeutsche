import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import {
  defaultPublicLocale,
  isLocale,
  localeForPathname,
  type Locale,
} from './config';

/** Header opcional para fixar o locale explicitamente (proxy/middleware). */
export const LOCALE_HEADER = 'x-app-locale';

/**
 * Resolve locale + mensagens de cada request.
 *
 * CAUSA RAIZ do bug das chaves cruas no admin: este callback ignorava o
 * parâmetro `requestLocale`. Quando alguém chama `getTranslations({locale})`,
 * o next-intl reexecuta este config passando o locale pedido em
 * `requestLocale` — é ASSIM que um locale explícito carrega o catálogo certo.
 * Sem ler esse parâmetro, o pedido era descartado e as mensagens vinham sempre
 * do locale detectado do request (no admin sem header: `de`, que é vazio →
 * MISSING_MESSAGE → next-intl imprime a própria chave).
 *
 * A detecção por `x-pathname` (setado no middleware) continua como fallback do
 * lado público. O admin não depende mais dela: passa o locale explicitamente
 * via `@/i18n/admin`, o que é determinístico em qualquer runtime — a mutação
 * `request.headers.set()` no middleware não é confiável no edge da Vercel.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // 1) locale pedido explicitamente por quem chamou
  const requested = await requestLocale;
  if (isLocale(requested)) {
    return {
      locale: requested,
      messages: (await import(`./messages/${requested}.json`)).default,
    };
  }

  // 2) senão, detecta a partir do request
  const headerList = await headers();
  const pinned = headerList.get(LOCALE_HEADER);
  const pathname = headerList.get('x-pathname');

  const locale: Locale = isLocale(pinned)
    ? pinned
    : pathname
      ? localeForPathname(pathname)
      : defaultPublicLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
