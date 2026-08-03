/**
 * Rótulo da linha sintética de transporte do dia ('day_transport').
 *
 * Essa linha NÃO é um serviço do catálogo — o slug é o sentinela
 * '__day_transport__' e ela é filtrada de tudo que o cliente vê (página
 * pública, PDF, texto de WhatsApp). É informação de admin.
 *
 * Por isso o que vai para `items[].service_name` no jsonb é um IDENTIFICADOR
 * ESTÁVEL, sem idioma; a tradução acontece na hora de exibir, via
 * admin.propostas.transporteDia.* (pt-BR.json).
 */

export type DayTransportKey =
  | 'day_transport_driver_car'
  | 'day_transport_driver'
  | 'day_transport_rental_car'
  | 'day_transport_disabled';

/** Identificador gravado no banco a partir dos toggles do dia. */
export function dayTransportServiceName(toggles: {
  uses_driver: boolean;
  uses_rental_car: boolean;
}): DayTransportKey {
  if (toggles.uses_driver && toggles.uses_rental_car) return 'day_transport_driver_car';
  if (toggles.uses_driver) return 'day_transport_driver';
  if (toggles.uses_rental_car) return 'day_transport_rental_car';
  return 'day_transport_disabled';
}

/**
 * Retrocompatibilidade: até esta mudança, o valor gravado era um literal em
 * alemão. Propostas já salvas continuam com essas strings no jsonb, então o
 * caminho de exibição precisa reconhecê-las.
 */
const LEGACY_GERMAN_TO_KEY: Record<string, DayTransportKey> = {
  'Privattransport (Fahrzeug + Fahrer)': 'day_transport_driver_car',
  'Privater Fahrer': 'day_transport_driver',
  Mietwagen: 'day_transport_rental_car',
  'Privattransport (deaktiviert)': 'day_transport_disabled',
};

const KEYS = new Set<string>([
  'day_transport_driver_car',
  'day_transport_driver',
  'day_transport_rental_car',
  'day_transport_disabled',
]);

/**
 * service_name armazenado → chave de tradução. Aceita tanto os identificadores
 * novos quanto os literais alemães antigos; devolve null para qualquer outra
 * coisa, para o chamador exibir o valor cru em vez de esconder informação.
 */
export function resolveDayTransportKey(storedServiceName: string): DayTransportKey | null {
  if (KEYS.has(storedServiceName)) return storedServiceName as DayTransportKey;
  return LEGACY_GERMAN_TO_KEY[storedServiceName] ?? null;
}
