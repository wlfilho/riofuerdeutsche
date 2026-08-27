import type { ContactUrls } from './settings'

/**
 * Único ponto do projeto com os dados de contato cravados.
 *
 * A fonte real é sempre o admin (`/admin/configuracoes` → `public_contact_info`),
 * lido por `getSettings()` + `buildContactUrls()`. Este objeto só entra em cena
 * quando o banco não responde ou devolve campo vazio, para o header/footer não
 * ficarem com link morto.
 *
 * Mora num módulo separado de `settings.ts` de propósito: `settings.ts` importa
 * o client Supabase de servidor (`next/headers`), e o Navbar e o Footer são
 * client components. O `import type` acima é apagado no build, então este
 * arquivo continua seguro para os dois lados.
 *
 * ATENÇÃO — isto aqui apodrece em silêncio. Estes valores são uma CÓPIA do que
 * está em `public_contact_info` (`business_phone`, `business_whatsapp`,
 * `business_email`, `business_instagram`, `business_youtube`, `business_facebook`,
 * `business_telegram`, `business_address`). Nada valida que as duas pontas
 * batem: se o número mudar só no admin, este arquivo continua compilando e
 * passando nos testes, e um dia o banco falha e o site volta a mostrar um
 * número morto — foi exatamente assim que o WhatsApp antigo sobreviveu aqui
 * por meses depois de desativado (corrigido em 26/08/2026).
 *
 * Trocou de número/e-mail/rede social? Muda no admin E espelha aqui. Em
 * nenhum outro lugar do projeto — link de contato cravado fora deste arquivo
 * é bug.
 *
 * Conferir com:
 *   select * from public_contact_info;
 */
export const FALLBACK_CONTACT: ContactUrls = {
  phone: '+55 21 96752 7243',
  phoneHref: 'tel:+5521967527243',
  whatsappHref: 'https://wa.me/5521967527243',
  email: 'riofuerdeutsche@gmail.com',
  emailHref: 'mailto:riofuerdeutsche@gmail.com',
  instagramHref: 'https://instagram.com/riofuerdeutsche',
  youtubeHref: 'https://youtube.com/@riofuerdeutsche',
  facebookHref: 'https://facebook.com/riofuerdeutsche',
  telegramHref: 'https://t.me/wlfilho',
  telegram: 'wlfilho',
  address: 'Rio de Janeiro, Brasilien',
}
