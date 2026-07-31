import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import {
  defaultPublicLocale,
  isLocale,
  localeForPathname,
  type Locale,
} from './config';

/**
 * Header a proxy/middleware can set to pin the locale explicitly. Nothing sets
 * it today; see the note below on why pathname detection is not automatic.
 */
export const LOCALE_HEADER = 'x-app-locale';

/**
 * Resolving the locale from the request pathname is NOT possible here without
 * middleware support: Next strips `next-url` from document requests, and
 * `getRequestConfig` receives no pathname of its own. Verified empirically on
 * Next 16.1.6 — the only headers that reach this point are host/user-agent/
 * accept/x-forwarded-*.
 *
 * Rather than depend on `referer` (absent on direct loads, and pointing at the
 * *previous* page during navigation, which would render admin pages in German),
 * we default to the public locale and let admin surfaces opt in explicitly via
 * `getTranslations({locale: adminLocale})` or the `x-app-locale` header.
 *
 * When the admin panel starts consuming translations, the clean fix is to set
 * `x-app-locale` in the middleware/proxy — a one-line change there, at which
 * point this resolves automatically.
 */
export default getRequestConfig(async () => {
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
