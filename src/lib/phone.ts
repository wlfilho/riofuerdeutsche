// src/lib/phone.ts
//
// Normalização de telefone pra casar números vindos de fontes com formatos
// diferentes (WhatsApp, formulário do cliente, CRM).

/** Só dígitos. "+49 170 1624062" -> "491701624062" */
export function digitsOnly(s: unknown): string {
  return typeof s === "string" ? s.replace(/\D+/g, "") : "";
}

/**
 * Os últimos 8 dígitos são a chave de casamento com `contacts.phone`.
 *
 * O cliente digita o telefone de um jeito e o WhatsApp entrega de outro: DDI
 * com ou sem, o nono dígito brasileiro que aparece e some, o zero nacional
 * alemão que o cliente às vezes escreve. Os últimos 8 sobrevivem a todas
 * essas variações e ainda são específicos o bastante pra não colidir numa
 * base do tamanho desta.
 */
export function phoneTail(digits: string): string | null {
  return digits.length >= 8 ? digits.slice(-8) : null;
}
